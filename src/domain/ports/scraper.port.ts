import type { JobOffer } from '../entities/job-offer.entity';

/**
 * Port leveraging Command/Strategy pattern for scraping.
 * Adapters (LinkedIn, WTTJ) must implement this.
 */
export interface ScraperPort {
  /**
   * Scrapes job offers from the source.
   * @returns A promise resolving to a list of JobOffer entities.
   */
  scrape(): Promise<JobOffer[]>;

  /**
   * Identifier for the source (e.g. 'LINKEDIN').
   */
  readonly sourceName: string;
}
