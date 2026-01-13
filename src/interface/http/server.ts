
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as path from 'path';
import { CryptoConfigService } from '../../infrastructure/config/crypto-config.service';
import { configRoutes } from './api.js';

export class HttpServer {
    private app: express.Application;
    private port = 3000;

    constructor(private readonly configService: CryptoConfigService) {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    private setupRoutes(): void {
        // API Routes
        this.app.use('/api', configRoutes(this.configService));

        // Fallback to index.html
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`🌐 Web Interface running at http://localhost:${this.port}`);
        });
    }
}
