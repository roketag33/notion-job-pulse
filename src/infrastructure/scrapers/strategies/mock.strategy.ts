import type { Page } from 'playwright';
import { JobOffer } from '../../../domain/entities/job-offer.entity';
import { ScraperStrategy } from '../scraper.strategy';

export class MockScraperStrategy extends ScraperStrategy {
  readonly name = 'MOCK_LINKEDIN';
  readonly baseUrl = 'http://localhost:3000'; // Dummy

  async scrapeObject(_page: Page): Promise<JobOffer[]> {
    console.log('Mock scraping executing...');
    // Return dummy data
    return [
      new JobOffer(
        'mock-1',
        'Senior React Developer',
        'Tech Corp',
        'Paris',
        'https://linkedin.com/jobs/123',
        'LINKEDIN',
      ),
      new JobOffer(
        'mock-2',
        'Node.js Backend Engineer',
        'Startup A',
        'Remote',
        'https://wttj.co/jobs/456',
        'WTTJ',
      ),
    ];
  }
}
