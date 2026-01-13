export interface JobOfferTable {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  description: string | null;
  salary: string | null;
  status: string; // 'PENDING' | 'PROCESSED' | 'APPLIED' | 'ARCHIVED'
  created_at: string; // ISO String for SQLite
  updated_at: string; // ISO String for SQLite
}

export interface Database {
  job_offers: JobOfferTable;
}
