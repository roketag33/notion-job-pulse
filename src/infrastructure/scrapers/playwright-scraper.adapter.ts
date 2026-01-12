import { type Browser, chromium, type Page } from 'playwright';
import type { JobOffer } from '../../domain/entities/job-offer.entity';
import type { ScraperPort } from '../../domain/ports/scraper.port';
import type { ScraperStrategy } from './scraper.strategy';

/**
 * Concrete Adapter for Scraping using Playwright.
 * Manages Browser lifecycle and delegates to strategies.
 */
export class PlaywrightScraperAdapter implements ScraperPort {
  private browser: Browser | null = null;

  constructor(private readonly strategy: ScraperStrategy) {}

  get sourceName(): string {
    return this.strategy.name;
  }

  async scrape(): Promise<JobOffer[]> {
    try {
      this.browser = await chromium.launch({ headless: false }); // Debug mode: visible
      const context = await this.browser.newContext();
      const page = await context.newPage();

      await this.strategy.login(page);
      const offers = await this.strategy.scrapeObject(page);

      return offers;
    } catch (error) {
      console.error(`Error scraping ${this.sourceName}:`, error);
      return [];
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}
