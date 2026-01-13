export type JobOfferStatus = 'PENDING' | 'PROCESSED' | 'APPLIED' | 'ARCHIVED';

export class JobOffer {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly company: string,
    public readonly location: string,
    public readonly url: string,
    public readonly source: string, // e.g., 'LinkedIn', 'WTTJ'
    public readonly description?: string,
    public readonly salary?: string,
    public readonly status: JobOfferStatus = 'PENDING',
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) { }

  /**
   * Validation logic for the entity.
   * Ensures essential fields are present.
   */
  public isValid(): boolean {
    return this.title.length > 0 && this.company.length > 0 && this.url.startsWith('http');
  }

  public markAsProcessed(): JobOffer {
    return new JobOffer(
      this.id,
      this.title,
      this.company,
      this.location,
      this.url,
      this.source,
      this.description,
      this.salary,
      'PROCESSED',
      this.createdAt,
      new Date(),
    );
  }
}
