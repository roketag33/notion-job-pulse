import { Client } from '@notionhq/client';
import type { JobOffer } from '../../domain/entities/job-offer.entity';
import type { NotionPort } from '../../domain/ports/notion.port';

export class NotionAdapter implements NotionPort {
    private notion: Client;
    private databaseId: string;
    private token: string;

    constructor(token: string, databaseId: string) {
        this.notion = new Client({ auth: token });
        this.token = token;
        this.databaseId = databaseId;
    }

    async searchPages(): Promise<{ id: string; title: string }[]> {
        const response = await this.notion.search({
            filter: {
                value: 'page',
                property: 'object',
            },
            sort: {
                direction: 'descending',
                timestamp: 'last_edited_time',
            },
        });

        return response.results.map((page: any) => {
            const titleProp =
                page.properties?.title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text ||
                'Untitled';

            return {
                id: page.id,
                title: titleProp,
            };
        });
    }

    async getDatabaseSchema(): Promise<string[]> {
        try {
            console.log(`🔍 Inspecting schema for DB: ${this.databaseId}`);
            const response = await fetch(`https://api.notion.com/v1/databases/${this.databaseId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Notion-Version': '2022-06-28',
                },
            });

            if (!response.ok) {
                console.error(`❌ Notion API Error: ${response.status} ${response.statusText}`);
                return [];
            }

            const data = (await response.json()) as any;
            if (!data.properties) {
                console.error('❌ "properties" field is MISSING in Notion response (fetch).');
                return [];
            }

            const keys = Object.keys(data.properties);
            console.log('🔑 Found Keys:', keys);
            return keys;
        } catch (e) {
            console.error('Failed to retrieve database schema:', e);
            return [];
        }
    }

    async updateDatabaseSchema(dbId: string): Promise<void> {
        console.log(`🛠️ Updating schema for DB: ${dbId} (via fetch)`);

        // Use raw fetch to bypass generic client validation blocking property additions
        const response = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                properties: {
                    Company: { rich_text: {} },
                    Location: { rich_text: {} },
                    URL: { url: {} },
                    Status: {
                        select: {
                            options: [
                                { name: 'New', color: 'blue' },
                                { name: 'Applied', color: 'yellow' },
                                { name: 'Interview', color: 'orange' },
                                { name: 'Rejected', color: 'red' },
                                { name: 'Offer', color: 'green' },
                            ],
                        },
                    },
                    Source: {
                        select: {
                            options: [
                                { name: 'LinkedIn', color: 'blue' },
                                { name: 'WTTJ', color: 'yellow' },
                            ],
                        },
                    },
                },
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`❌ Failed to update schema: ${err}`);
            throw new Error(`Schema mismatch fix failed: ${err}`);
        }

        const data = (await response.json()) as any;
        console.log('✅ Update Response Properties:', Object.keys(data.properties || {}));
    }

    async provisionDatabase(parentPageId: string): Promise<string> {
        const createResponse = await this.notion.databases.create({
            parent: { type: 'page_id', page_id: parentPageId },
            title: [{ type: 'text', text: { content: '🤖 Job Offers (Scrapper)' } }],
            properties: { Name: { title: {} } },
        } as any);

        const dbId = createResponse.id;
        console.log(`Phase 1: Database created (${dbId}). Updating schema...`);

        await this.updateDatabaseSchema(dbId);

        console.log('Phase 2: Schema applied successfully.');
        return dbId;
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.notion.users.me({});
            return true;
        } catch (e) {
            console.error('Notion Health Check Failed:', e);
            return false;
        }
    }

    async createJobPage(offer: JobOffer): Promise<string> {
        const response = await this.notion.pages.create({
            parent: { database_id: this.databaseId },
            properties: {
                Name: { title: [{ text: { content: offer.title } }] },
                Company: { rich_text: [{ text: { content: offer.company } }] },
                Location: { rich_text: [{ text: { content: offer.location } }] },
                URL: { url: offer.url },
                Status: { select: { name: 'New' } },
                Source: { select: { name: offer.source } },
            },
        });
        return response.id;
    }
}
