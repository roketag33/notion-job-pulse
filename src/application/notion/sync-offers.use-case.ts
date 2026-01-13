import type { NotionPort } from '../../domain/ports/notion.port';
import type { JobOfferRepositoryPort } from '../../domain/ports/repository.port';

export class SyncOffersUseCase {
  constructor(
    private readonly repository: JobOfferRepositoryPort,
    private readonly notion: NotionPort,
  ) { }

  async execute(): Promise<void> {
    console.log('--- SyncOffersUseCase Started ---');

    // 1. Fetch pending offers
    const pendingOffers = await this.repository.findAll('PENDING');
    console.log(`Found ${pendingOffers.length} pending offers.`);

    if (pendingOffers.length === 0) {
      console.log('No offers to sync.');
      return;
    }

    // 2. Sync loop
    let successCount = 0;
    for (const offer of pendingOffers) {
      try {
        console.log(`Syncing offer: ${offer.title}...`);

        // Check for duplicates
        const existingPageId = await this.notion.findPageByUrl(offer.url);

        let notionPageId: string;
        if (existingPageId) {
          console.log(
            ` -> ⚠️ Offer already exists in Notion (Page ID: ${existingPageId}). Skipping creation.`,
          );
          notionPageId = existingPageId;
        } else {
          // Send to Notion
          notionPageId = await this.notion.createJobPage(offer);
          console.log(` -> Synced to Notion (Page ID: ${notionPageId})`);
        }

        // Update local status
        const processedOffer = offer.markAsProcessed();
        await this.repository.save(processedOffer);
        successCount++;
        successCount++;
      } catch (error) {
        console.error(`Failed to sync offer ${offer.id}:`, error);
      }
    }

    console.log(
      `Sync Complete. Successfully synchronized ${successCount}/${pendingOffers.length} offers.`,
    );
  }
}
