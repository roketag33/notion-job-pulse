import type { Page } from 'playwright';
import type { JobOffer } from '../../domain/entities/job-offer.entity';

/**
 * Abstract Strategy for Scrapers.
 * Each source (LinkedIn, WTTJ) will have its own implementation.
 */
export abstract class ScraperStrategy {
  abstract readonly name: string;
  abstract readonly baseUrl: string;

  /**
   * Main scraping method for the strategy.
   * @param page Playwright Page instance
   */
  abstract scrapeObject(page: Page): Promise<JobOffer[]>;

  /**
   * Optional: Login logic if required by the source.
   */
  async login(_page: Page): Promise<void> {
    // Default: No login
  }
}
