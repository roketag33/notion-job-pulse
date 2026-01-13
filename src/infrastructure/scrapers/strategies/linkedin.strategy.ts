import * as crypto from 'node:crypto';
import type { Page } from 'playwright';
import { JobOffer } from '../../../domain/entities/job-offer.entity';
import type { UserConfig } from '../../../domain/entities/user-config.entity';
import { ScraperStrategy } from '../scraper.strategy';

export class LinkedInStrategy extends ScraperStrategy {
  readonly name = 'LINKEDIN';
  readonly baseUrl = 'https://www.linkedin.com';

  constructor(private readonly config: UserConfig) {
    super();
  }

  async login(page: Page): Promise<void> {
    const { linkedInEmail, linkedInPassword } = this.config.scrapers;

    if (!linkedInEmail || !linkedInPassword) {
      console.log('⚠️ No LinkedIn credentials found in config. Skipping login.');
      return;
    }

    console.log('🔐 Logging in to LinkedIn...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

    await page.fill('#username', linkedInEmail);
    await page.fill('#password', linkedInPassword);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL('**/feed/**', { timeout: 15000 });
      console.log('✅ LinkedIn Login Successful');
    } catch (_e) {
      console.error('❌ LinkedIn Login Failed (or 2FA required). Check screenshot.');
      // Continue anyway, maybe public search works?
    }
  }

  async scrapeObject(page: Page): Promise<JobOffer[]> {
    const { keywords, location } = this.config.search;
    console.log(`🔎 Searching LinkedIn for: "${keywords}" in "${location}"`);

    // Build Search URL
    const query = encodeURIComponent(keywords);
    const loc = encodeURIComponent(location);
    const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${query}&location=${loc}&f_TPR=r86400`;

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    await page
      .waitForSelector('.jobs-search-results-list', { timeout: 10000 })
      .catch(() => console.log('List not found immediately'));

    // Scroll
    try {
      await page.evaluate(() => {
        const list = document.querySelector('.jobs-search-results-list');
        if (list) {
          list.scrollTop = list.scrollHeight;
        }
      });
      await page.waitForTimeout(2000);
    } catch (_e) {}

    const jobCards = await page.$$('.job-card-container');
    console.log(`Found ${jobCards.length} job cards.`);

    const offers: JobOffer[] = [];

    for (const card of jobCards) {
      try {
        const offerData = await card.evaluate((el) => {
          const titleEl = el.querySelector('.artdeco-entity-lockup__title a');
          const companyEl = el.querySelector('.artdeco-entity-lockup__subtitle');
          const locationEl = el.querySelector('.artdeco-entity-lockup__caption');
          const rawUrl = titleEl?.getAttribute('href') || '';
          const url = rawUrl.split('?')[0];

          return {
            title: titleEl?.textContent?.trim() || 'Unknown Title',
            company: companyEl?.textContent?.trim() || 'Unknown Company',
            location: locationEl?.textContent?.trim() || 'Unknown Location',
            url: url ? `https://www.linkedin.com${url}` : '',
          };
        });

        if (!offerData.url) continue;

        // Click for description
        await card.click().catch(() => {});
        await page.waitForTimeout(1000);
        const description = await page
          .locator('.jobs-description-content__text')
          .innerText()
          .catch(() => '');

        offers.push(
          new JobOffer(
            crypto.randomUUID(),
            offerData.title,
            offerData.company,
            offerData.location,
            offerData.url,
            'LINKEDIN', // Source
            description,
            undefined, // Salary
            'PENDING', // Status
          ),
        );
      } catch (err) {
        console.warn('Error scraping a card:', err);
      }
    }

    return offers;
  }
}
