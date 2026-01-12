import prompts from 'prompts';
import { DEFAULT_CONFIG, type UserConfig } from '../../domain/entities/user-config.entity';
import type { CryptoConfigService } from '../../infrastructure/config/crypto-config.service';
import { NotionAdapter } from '../../infrastructure/notion/notion.adapter';

export class SetupWizard {
  constructor(private readonly configService: CryptoConfigService) {}

  async run(): Promise<void> {
    console.log('🔮 ScrapperOffre Setup Wizard');
    console.log('-----------------------------');

    const loaded = this.configService.loadConfig();
    const currentConfig: UserConfig = {
      ...DEFAULT_CONFIG,
      ...loaded,
      search: { ...DEFAULT_CONFIG.search, ...(loaded?.search || {}) },
      scrapers: { ...DEFAULT_CONFIG.scrapers, ...(loaded?.scrapers || {}) },
    };

    const responseToken = await prompts({
      type: 'text',
      name: 'notionToken',
      message: 'Enter your Notion Integration Token:',
      initial: currentConfig.notionToken,
      validate: (value) => (value.length > 5 ? true : 'Token invalid'),
    });

    if (!responseToken.notionToken) return;

    // Initialize temporary adapter with Token only (DB ID not yet known)
    const tempAdapter = new NotionAdapter(responseToken.notionToken, '');

    console.log('🔄 Connecting to Notion...');
    if (!(await tempAdapter.healthCheck())) {
      console.log('❌ Invalid Token. Please check integration rights.');
      return;
    }

    console.log('🔍 Searching for accessible pages...');
    const pages = await tempAdapter.searchPages();

    if (pages.length === 0) {
      console.log('❌ No accessible pages found. Make sure you invited the bot to a page.');
      return;
    }

    const responsePage = await prompts({
      type: 'select',
      name: 'pageId',
      message: 'Select the Parent Page for the Job Board:',
      choices: pages.map((p) => ({ title: p.title, value: p.id })),
    });

    if (!responsePage.pageId) return;

    console.log('🧱 Provisioning "Job Offers" Database...');
    let dbId: string;
    try {
      dbId = await tempAdapter.provisionDatabase(responsePage.pageId);
      console.log(`✅ Database created! ID: ${dbId}`);
    } catch (e) {
      console.error('❌ Failed to create database:', e);
      return;
    }

    const responsePoll = await prompts([
      {
        type: 'text',
        name: 'keywords',
        message: 'Search Keywords (e.g. "React Developer"):',
        initial: currentConfig.search.keywords,
      },
      {
        type: 'text',
        name: 'location',
        message: 'Location (e.g. "Paris", "Remote"):',
        initial: currentConfig.search.location,
      },
      {
        type: 'confirm',
        name: 'useLinkedIn',
        message: 'Configure LinkedIn Scraper?',
        initial: !!currentConfig.scrapers.linkedInEmail,
      },
      {
        type: 'text',
        name: 'linkedInEmail',
        message: 'LinkedIn Email:',
        initial: currentConfig.scrapers.linkedInEmail,
        prev: 'useLinkedIn', // Only if useLinkedIn is true
      },
      {
        type: 'password',
        name: 'linkedInPassword',
        message: 'LinkedIn Password:',
        initial: currentConfig.scrapers.linkedInPassword,
        prev: 'linkedInEmail', // Only if email was asked/set
      },
      {
        type: 'number',
        name: 'pollIntervalMinutes',
        message: 'Polling Interval (minutes):',
        initial: currentConfig.pollIntervalMinutes,
        min: 1,
      },
    ] as any);

    const newConfig: UserConfig = {
      ...currentConfig,
      notionToken: responseToken.notionToken,
      notionDatabaseId: dbId,
      search: {
        keywords: responsePoll.keywords,
        location: responsePoll.location,
      },
      scrapers: {
        ...currentConfig.scrapers,
        linkedInEmail: responsePoll.linkedInEmail,
        linkedInPassword: responsePoll.linkedInPassword,
      },
      pollIntervalMinutes: responsePoll.pollIntervalMinutes,
    };

    this.configService.saveConfig(newConfig);
    console.log('🔒 Configuration Encrypted & Saved.');
  }
}
