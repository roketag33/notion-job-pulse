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

export class JobScheduler {
  constructor(private readonly config: UserConfig) {}

  async start(): Promise<void> {
    console.log(
      `[JobScheduler] Starting workflow... (Poll Interval: ${this.config.pollIntervalMinutes}m)`,
    );

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

    const scrapers = strategies.map((s) => new PlaywrightScraperAdapter(s));

    // 2. UseCases Initialization
    const scrapeUseCase = new ScrapeAllOffersUseCase(scrapers, repository);
    const syncUseCase = new SyncOffersUseCase(repository, notionAdapter);

    // 3. Execution (Sequential for now)
    try {
      console.log('--- Step 1: Scraping ---');
      await scrapeUseCase.execute();

      console.log('--- Step 2: Syncing ---');
      await syncUseCase.execute();

      console.log('[JobScheduler] Workflow finished successfully.');
    } catch (error) {
      console.error('[JobScheduler] Error during workflow execution:', error);
    }
  }
}
