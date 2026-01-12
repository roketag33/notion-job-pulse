import type { JobOffer } from '../entities/job-offer.entity';

/**
 * Port for Data Persistence.
 * Decouples Domain from Database implementation (SQLite/Kysely).
 */
export interface JobOfferRepositoryPort {
  save(offer: JobOffer): Promise<void>;
  saveBatch(offers: JobOffer[]): Promise<void>;
  findById(id: string): Promise<JobOffer | null>;
  findByUrl(url: string): Promise<JobOffer | null>;
  findAll(status?: string): Promise<JobOffer[]>;
}
