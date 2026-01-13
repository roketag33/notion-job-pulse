import * as crypto from 'node:crypto';
import type { Page } from 'playwright';
import { JobOffer } from '../../../domain/entities/job-offer.entity';
import type { UserConfig } from '../../../domain/entities/user-config.entity';
import { ScraperStrategy } from '../scraper.strategy';

export class WTTJStrategy extends ScraperStrategy {
  readonly name = 'WTTJ';
  readonly baseUrl = 'https://www.welcometothejungle.com';

  constructor(private readonly config: UserConfig) {
    super();
  }

  async scrapeObject(page: Page): Promise<JobOffer[]> {
    const { keywords, location } = this.config.search;
    console.log(`🔎 Searching WTTJ for: "${keywords}" in "${location}"`);

    const query = encodeURIComponent(keywords);
    const loc = encodeURIComponent(location);
    // WTTJ Search URL structure
    const searchUrl = `${this.baseUrl}/fr/jobs?query=${query}&aroundQuery=${loc}`;

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    // Wait for the list of results using data-testid
    await page.waitForSelector('ul[data-testid="search-results"]', { timeout: 15000 }).catch(() => {
      console.warn('⚠️ WTTJ: Job list not found, might be empty or selectors changed.');
    });

    // Accept cookies if present (good practice, as seen in manual probe)
    try {
      const cookieBtn = await page.$('button#axeptio_btn_accept_all');
      if (cookieBtn) {
        await cookieBtn.click();
        await page.waitForTimeout(500);
      }
    } catch (_e) {}

    const offers: JobOffer[] = [];
    let hasNextPage = true;
    let pageNum = 1;
    const MAX_PAGES = 5; // Safety limit

    while (hasNextPage && pageNum <= MAX_PAGES) {
      console.log(`📄 WTTJ Page ${pageNum}...`);

      // Wait for cards
      await page.waitForTimeout(2000); // Allow render

      const cards = await page.$$('li[data-testid="search-results-list-item-wrapper"]');
      console.log(`Found ${cards.length} cards on this page.`);

      for (const card of cards) {
        try {
          // Extract data inside the card context
          const data = await card.evaluate((el, _baseUrl) => {
            const titleEl = el.querySelector('h2');
            const linkEl = el.querySelector('a[href*="/jobs/"]') as HTMLAnchorElement;
            const companyEl = el.querySelector(
              'a[href^="/fr/companies/"]:not([href*="/jobs/"]) span',
            );

            // Location is tricky, often usually the 2nd or 3rd span or next to an icon
            // Let's try to grab all text content and parse or look for specific structure
            // Strategy: Grab the text of the element that looks like metadata
            // WTTJ often puts location in a metadata row.
            // Let's look for the <ul> containing metadata if strict selectors fail
            const _metaList = el.querySelector('ul.wc-block-grid-list');
            let locationText = 'Unknown Location';

            // Fallback: try to find the 'Location' icon or guess based on structure
            // Using the metadata spans (often: Contract • Location • Date)
            const spans = Array.from(el.querySelectorAll('div > span'));
            // The location is usually the 2nd span in the metadata block directly under title
            // But let's try safely.
            if (spans.length >= 2) {
              locationText = spans[1].textContent?.trim() || locationText;
            }

            return {
              title: titleEl?.textContent?.trim() || 'Unknown Title',
              url: linkEl?.getAttribute('href') || '',
              company: companyEl?.textContent?.trim() || 'Unknown Company',
              location: locationText,
            };
          }, this.baseUrl);

          if (!data.url) continue;

          // Resolve full URL
          const fullUrl = data.url.startsWith('http') ? data.url : `${this.baseUrl}${data.url}`;

          offers.push(
            new JobOffer(
              crypto.randomUUID(),
              data.title,
              data.company,
              data.location,
              fullUrl,
              'WTTJ',
              '', // Description requires visiting the page, skipping for now for speed
              undefined,
              'PENDING',
            ),
          );
        } catch (e) {
          console.warn('Error extracting card data:', e);
        }
      }

      // Pagination
      // Selector: nav[aria-label="Pagination"] li:last-child a
      const nextButton = await page.$('nav[aria-label="Pagination"] li:last-child a');

      // Check if disabled implies no "href" or specific class?
      // Often the last child is "Next", if it's disabled it might not have href or handle click.
      if (nextButton) {
        // Check if it's actually "Next" and not just the last number
        // Usually WTTJ puts a chevron.
        const isNext = await nextButton.evaluate(
          (el) => !el.getAttribute('aria-disabled') && el.getAttribute('href'),
        );

        if (isNext) {
          await nextButton.click();
          await page.waitForURL(/page=/, { timeout: 10000 }).catch(() => {});
          pageNum++;
        } else {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
    }

    return offers;
  }
}
