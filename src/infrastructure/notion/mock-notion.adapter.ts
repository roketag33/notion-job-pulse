import type { JobOffer } from '../../domain/entities/job-offer.entity';
import type { NotionPort } from '../../domain/ports/notion.port';

export class MockNotionAdapter implements NotionPort {
  async createJobPage(offer: JobOffer): Promise<string> {
    console.log(`[MockNotion] Creating page for: ${offer.title}`);
    return `mock-page-id-${Math.floor(Math.random() * 1000)}`;
  }

  async searchPages(): Promise<{ id: string; title: string }[]> {
    return [];
  }

  async provisionDatabase(parentPageId: string): Promise<string> {
    return 'mock-db-id';
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
