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

  async updateDatabaseSchema(_dbId: string): Promise<void> {
    // no-op
  }

  async findPageByUrl(_url: string): Promise<string | null> {
    return null;
  }

  async provisionDatabase(_parentPageId: string): Promise<string> {
    return 'mock-db-id';
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
