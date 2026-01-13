
import { Router } from 'express';
import type { CryptoConfigService } from '../../infrastructure/config/crypto-config.service';
import { DEFAULT_CONFIG, type UserConfig } from '../../domain/entities/user-config.entity';
import { JobScheduler } from '../worker/job-scheduler.js';

export function configRoutes(configService: CryptoConfigService): Router {
    const router = Router();

    // GET Config
    router.get('/config', (req, res) => {
        const config = configService.loadConfig();
        res.json(config || DEFAULT_CONFIG);
    });

    // POST Config
    router.post('/config', (req, res) => {
        try {
            const newConfig: UserConfig = req.body;
            // Basic validation could go here
            configService.saveConfig(newConfig);
            res.json({ success: true, message: 'Configuration saved!' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to save config.' });
        }
    });

    // POST Run (Manual Trigger)
    // Note: This spawns a background run.
    router.post('/run', async (req, res) => {
        const config = configService.loadConfig();
        if (!config) {
            return res.status(400).json({ message: 'No config found' });
        }

        console.log('⚡ Manual run triggered from UI');
        // Fire and forget (or separate UseCase execution)
        const scheduler = new JobScheduler(config);
        scheduler.runOnce().catch(err => console.error(err));

        res.json({ success: true, message: 'Scraper started in background.' });
    });

    return router;
}
