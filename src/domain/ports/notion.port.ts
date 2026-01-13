import type { JobOffer } from '../entities/job-offer.entity';

export interface NotionPort {
  /**
   * Send a job offer to the Notion Database.
   * @returns The Notion Page ID if successful.
   */
  createJobPage(offer: JobOffer): Promise<string>;

  /**
   * Check if the Notion client is authenticated/ready.
   */
  healthCheck(): Promise<boolean>;

  /**
   * List accessible pages (titles and IDs) for the integration.
   */
  searchPages(): Promise<{ id: string; title: string }[]>;

  /**
   * Create the Job Offers database schema under a parent page.
   * @returns The new Database ID.
   */
  provisionDatabase(parentPageId: string): Promise<string>;

  /**
   * Find a page by its URL property.
   * @returns The Page ID if found, null otherwise.
   */
  findPageByUrl(url: string): Promise<string | null>;
}
