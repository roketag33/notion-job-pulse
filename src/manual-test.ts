import { SyncOffersUseCase } from './application/notion/sync-offers.use-case';
import { ScrapeAllOffersUseCase } from './application/scrapers/scrape-all.use-case';
import { JobOfferRepository } from './infrastructure/db/job-offer.repository';
import { MockNotionAdapter } from './infrastructure/notion/mock-notion.adapter';
import { PlaywrightScraperAdapter } from './infrastructure/scrapers/playwright-scraper.adapter';
import { MockScraperStrategy } from './infrastructure/scrapers/strategies/mock.strategy';

async function main() {
  console.log('--- Manual Verification: Scraper Pipeline ---');

  // 1. Instantiate Strategy
  const mockStrategy = new MockScraperStrategy(); // Mock LinkedIn

  // 2. Instantiate Adapter (Infrastructure)
  const playwrightAdapter = new PlaywrightScraperAdapter(mockStrategy);

  // 3. Instantiate Repository
  const repository = new JobOfferRepository();

  // 4. Instantiate Use Case (Application)
  // Inject the adapter and repository
  const useCase = new ScrapeAllOffersUseCase([playwrightAdapter], repository);

  // 5. Execute
  await useCase.execute();

  console.log('--- Verification Complete ---');

  // 6. Verify DB
  const savedOffers = await repository.findAll();
  console.log(`DB Verification: Found ${savedOffers.length} offers in database.`);
  savedOffers.forEach((o) => console.log(` - [${o.status}] ${o.title} (${o.company})`));

  // 7. Verify Sync (Notion)
  console.log('\n--- Sync Verification ---');
  const mockNotion = new MockNotionAdapter();
  const syncUseCase = new SyncOffersUseCase(repository, mockNotion);
  await syncUseCase.execute();

  // 8. Verify Status Update
  const processedOffers = await repository.findAll('PROCESSED');
  console.log(`Sync Complete. Found ${processedOffers.length} PROCESSED offers in DB.`);
}

main().catch(console.error);
