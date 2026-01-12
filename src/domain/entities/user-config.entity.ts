export interface ScraperCredentials {
  linkedInEmail?: string;
  linkedInPassword?: string;
  wttjEmail?: string;
  wttjPassword?: string;
}

export interface SearchCriteria {
  keywords: string;
  location: string;
}

export interface UserConfig {
  notionToken: string;
  notionDatabaseId: string;
  scrapers: ScraperCredentials;
  search: SearchCriteria;
  pollIntervalMinutes: number;
  openAiKey?: string; // Optional for future
}

export const DEFAULT_CONFIG: UserConfig = {
  notionToken: '',
  notionDatabaseId: '',
  scrapers: {},
  search: { keywords: 'Fullstack Developer', location: 'Paris' },
  pollIntervalMinutes: 15,
};
