import { Command } from 'commander';
import * as path from 'path';
import { CryptoConfigService } from '../../infrastructure/config/crypto-config.service';
import { JobOfferRepository } from '../../infrastructure/db/job-offer.repository';
import { NotionAdapter } from '../../infrastructure/notion/notion.adapter';
import { JobScheduler } from '../worker/job-scheduler';
import { SetupWizard } from './setup-wizard';

const program = new Command();
const BASE_PATH = process.cwd();
const configService = new CryptoConfigService(BASE_PATH);

program.name('scrapper-offre').description('Job Offer Scraper CLI').version('1.0.0');

program
  .command('setup')
  .description('Run the interactive setup wizard')
  .action(async () => {
    const wizard = new SetupWizard(configService);
    await wizard.run();
  });

program
  .command('run')
  .description('Run the scraper workflow once')
  .action(async () => {
    const config = configService.loadConfig();
    if (!config) {
      console.error('❌ No configuration found. Run "setup" first.');
      process.exit(1);
    }

    console.log('🚀 Starting Scrapper...');
    const scheduler = new JobScheduler(config);
    await scheduler.start();
  });

program
  .command('sync')
  .description('Sync pending offers to Notion without scraping')
  .action(async () => {
    const config = configService.loadConfig();
    if (!config || !config.notionToken || !config.notionDatabaseId) {
      console.error('❌ Missing Notion configuration. Run "setup" first.');
      process.exit(1);
    }

    console.log('🔄 Starting Sync Process...');

    // Init Adapters
    const { JobOfferRepository: SQLiteJobOfferRepository } = await import(
      '../../infrastructure/db/job-offer.repository.js'
    ); // Dynamic import to ensure DB init if needed
    const repository = new SQLiteJobOfferRepository();
    const notionAdapter = new NotionAdapter(config.notionToken, config.notionDatabaseId);

    // Health & Schema Check
    console.log(`🏥 Checking Notion connection (DB ID: ${config.notionDatabaseId})...`);
    const schema = await notionAdapter.getDatabaseSchema();
    console.log('📋 Detected Database Properties:', schema);

    const requiredProps = ['Name', 'Company', 'Location', 'URL', 'Status', 'Source'];
    const missingProps = requiredProps.filter((p) => !schema.includes(p));

    if (missingProps.length > 0) {
      console.error(
        `⚠️  WARNING: The following properties are MISSING in Notion: ${missingProps.join(', ')}`,
      );
      console.log('🛠️  Attempting to AUTO-REPAIR schema...');

      try {
        await notionAdapter.updateDatabaseSchema(config.notionDatabaseId);
        console.log('✅ Schema repaired successfully! Proceeding with sync...');
      } catch (error) {
        console.error('❌ Failed to repair schema:', error);
        console.error('Please run "npm run scraper:setup" manually.');
        process.exit(1);
      }
    } else {
      console.log('✅ Schema looks good.');
    }

    // Execute Sync
    const { SyncOffersUseCase } = await import('../../application/notion/sync-offers.use-case.js');
    const syncUseCase = new SyncOffersUseCase(repository, notionAdapter);
    await syncUseCase.execute();

    console.log('✅ Sync command finished.');
  });

program.parse();
