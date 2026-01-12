import type { NotionPort } from '../../domain/ports/notion.port';
import type { JobOfferRepositoryPort } from '../../domain/ports/repository.port';

export class SyncOffersUseCase {
  constructor(
    private readonly repository: JobOfferRepositoryPort,
    private readonly notion: NotionPort,
  ) {}

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

        // Send to Notion
        const notionPageId = await this.notion.createJobPage(offer);
        console.log(` -> Synced to Notion (Page ID: ${notionPageId})`);

        // Update local status
        // Create a copy or mutate? Entities are usually immutable-ish, but for now specific update.
        // We need a method on repo to update status or save the full entity.
        // Let's assume we update the status locally and save.

        // Clone and update status (Clean way)
        const updatedOffer = { ...offer, status: 'PROCESSED', updatedAt: new Date() } as any;
        // Note: The Entity class properties are readonly, so we need to instantiate new or use a method.
        // Ideally Entity should have a method `markAsProcessed()`.

        // For MVP, using repo save which handles upsert by ID.
        // But Entity constructor is needed.
        // Let's assume for now we just pass a modified object or add a method to Entity.
        // I will fix Entity to be more flexible or add a method later. For now, dirty cast or recreating.

        // Better: Add method to Entity.
        // For this step, I'll assume valid Entity or cloned one.

        // Let's temporarily cast to update status, or better, add a method to JobOffer entity?
        // Modifying Entity:
        // const processedOffer = new JobOffer(...params with 'PROCESSED')

        // Hack for speed:
        (offer as any).status = 'PROCESSED';
        await this.repository.save(offer);
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
