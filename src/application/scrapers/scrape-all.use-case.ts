import type { JobOfferRepositoryPort } from '../../domain/ports/repository.port';
import type { ScraperPort } from '../../domain/ports/scraper.port';

// TEMPORARY: Direct DB access until Repository Adapter is ready
// In Clean Arch, this should inject RepositoryPort.
export class ScrapeAllOffersUseCase {
  constructor(
    private readonly scrapers: ScraperPort[],
    private readonly repository: JobOfferRepositoryPort,
  ) {}

  async execute(): Promise<void> {
    console.log(`Starting ScrapeAllOffersUseCase with ${this.scrapers.length} scrapers.`);

    for (const scraper of this.scrapers) {
      console.log(`Scraping source: ${scraper.sourceName}...`);
      const offers = await scraper.scrape();
      console.log(`Found ${offers.length} offers from ${scraper.sourceName}.`);

      await this.repository.saveBatch(offers);
      console.log('Offers saved to database.');
    }
  }
}
