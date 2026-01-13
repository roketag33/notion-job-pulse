import { SyncOffersUseCase } from '../../application/notion/sync-offers.use-case';
import { ScrapeAllOffersUseCase } from '../../application/scrapers/scrape-all.use-case';
import type { UserConfig } from '../../domain/entities/user-config.entity';
import { JobOfferRepository } from '../../infrastructure/db/job-offer.repository';
import { MockNotionAdapter } from '../../infrastructure/notion/mock-notion.adapter';
import { NotionAdapter } from '../../infrastructure/notion/notion.adapter';
import { PlaywrightScraperAdapter } from '../../infrastructure/scrapers/playwright-scraper.adapter';
import type { ScraperStrategy } from '../../infrastructure/scrapers/scraper.strategy';
import { LinkedInStrategy } from '../../infrastructure/scrapers/strategies/linkedin.strategy';
import { MockScraperStrategy } from '../../infrastructure/scrapers/strategies/mock.strategy';
import { WTTJStrategy } from '../../infrastructure/scrapers/strategies/wttj.strategy';

export class JobScheduler {
  constructor(private readonly config: UserConfig) { }

  /**
   * Run the workflow once immediately.
   */
  async runOnce(): Promise<void> {
    console.log('[JobScheduler] Running workflow once...');
    await this.executeWorkflow();
  }

  /**
   * Start the scheduler in Daemon mode.
   * Runs immediately, then repeats every X minutes.
   */
  async startDaemon(): Promise<void> {
    const intervalMinutes = this.config.pollIntervalMinutes || 15;
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`[JobScheduler] 🟢 Starting Daemon Mode (Poll every ${intervalMinutes}m)`);

    // Run immediately on start
    await this.executeWorkflow();

    // Schedule loop
    setInterval(async () => {
      console.log(`[JobScheduler] ⏰ Triggering scheduled run...`);
      await this.executeWorkflow();
    }, intervalMs);

    // Keep process alive (if needed explicitly, though setInterval does it)
    console.log('[JobScheduler] Daemon is running. Press Ctrl+C to stop.');
  }

  private async executeWorkflow(): Promise<void> {
    // 1. Infrastructure Initialization
    const repository = new JobOfferRepository();

    // Notion Adapter (Use Mock if no token, or Real if configured)
    const notionAdapter = this.config.notionToken
      ? new NotionAdapter(this.config.notionToken, this.config.notionDatabaseId)
      : new MockNotionAdapter();

    // Scraper Strategies
    const strategies: ScraperStrategy[] = [new MockScraperStrategy()];

    if (this.config.scrapers.linkedInEmail) {
      console.log('📌 LinkedIn Scraper Enabled');
      strategies.push(new LinkedInStrategy(this.config));
    }

    // WTTJ is enabled by default
    console.log('📌 WTTJ Scraper Enabled');
    strategies.push(new WTTJStrategy(this.config));

    const scrapers = strategies.map((s) => new PlaywrightScraperAdapter(s));

    // 2. UseCases Initialization
    const scrapeUseCase = new ScrapeAllOffersUseCase(scrapers, repository);
    const syncUseCase = new SyncOffersUseCase(repository, notionAdapter);

    // 3. Execution
    try {
      console.log('--- Step 1: Scraping ---');
      await scrapeUseCase.execute();

      console.log('--- Step 2: Syncing ---');
      await syncUseCase.execute();

      console.log('[JobScheduler] Workflow finished successfully.');
    } catch (error) {
      console.error('[JobScheduler] ❌ Error during workflow execution:', error);
    }
  }
}
