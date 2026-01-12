import { JobOffer, type JobOfferStatus } from '../../domain/entities/job-offer.entity';
import type { JobOfferRepositoryPort } from '../../domain/ports/repository.port';
import { db } from './database';

export class JobOfferRepository implements JobOfferRepositoryPort {
  async save(offer: JobOffer): Promise<void> {
    await db
      .insertInto('job_offers')
      .values({
        id: offer.id,
        title: offer.title,
        company: offer.company,
        location: offer.location,
        url: offer.url,
        source: offer.source,
        description: offer.description ?? null,
        salary: offer.salary ?? null,
        status: offer.status,
        created_at: offer.createdAt.toISOString(),
        updated_at: offer.updatedAt.toISOString(),
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          title: offer.title,
          status: offer.status,
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();
  }

  async saveBatch(offers: JobOffer[]): Promise<void> {
    if (offers.length === 0) return;

    // Kysely doesn't support batch onConflict doUpdateSet easily for all dialects,
    // but SQLite supports it. iterating for safety for now or construct big query.
    // For MVP/Robustness, let's do sequential for now or Promise.all.
    // Better: use transaction.
    await db.transaction().execute(async (trx) => {
      for (const offer of offers) {
        await trx
          .insertInto('job_offers')
          .values({
            id: offer.id,
            title: offer.title,
            company: offer.company,
            location: offer.location,
            url: offer.url,
            source: offer.source,
            description: offer.description ?? null,
            salary: offer.salary ?? null,
            status: offer.status,
            created_at: offer.createdAt.toISOString(),
            updated_at: offer.updatedAt.toISOString(),
          })
          .onConflict((oc) =>
            oc.column('id').doUpdateSet({
              updated_at: new Date().toISOString(),
              // Update status only if needed? For now straightforward upsert
            }),
          )
          .execute();
      }
    });
  }

  async findById(id: string): Promise<JobOffer | null> {
    const row = await db
      .selectFrom('job_offers')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findByUrl(url: string): Promise<JobOffer | null> {
    const row = await db
      .selectFrom('job_offers')
      .selectAll()
      .where('url', '=', url)
      .executeTakeFirst();
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findAll(status?: string): Promise<JobOffer[]> {
    let query = db.selectFrom('job_offers').selectAll();

    if (status) {
      query = query.where('status', '=', status);
    }

    const rows = await query.execute();
    return rows.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: any): JobOffer {
    return new JobOffer(
      row.id,
      row.title,
      row.company,
      row.location,
      row.url,
      row.source,
      row.description ?? undefined,
      row.salary ?? undefined,
      row.status as JobOfferStatus,
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }
}
