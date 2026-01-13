import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { UserConfig } from '../../domain/entities/user-config.entity';

const ALGORITHM = 'aes-256-cbc';
const CONFIG_FILE = 'config.enc';
const KEY_FILE = '.master.key';

export class CryptoConfigService {
  private masterKey: Buffer;

  constructor(private readonly basePath: string) {
    this.masterKey = this.getOrCreateMasterKey();
  }

  private getOrCreateMasterKey(): Buffer {
    const keyPath = path.join(this.basePath, KEY_FILE);
    if (fs.existsSync(keyPath)) {
      const keyHex = fs.readFileSync(keyPath, 'utf8');
      return Buffer.from(keyHex, 'hex');
    }

    // Generate new key
    const newKey = crypto.randomBytes(32);
    fs.writeFileSync(keyPath, newKey.toString('hex'), { mode: 0o600 }); // User read/write only
    return newKey;
  }

  saveConfig(config: UserConfig): void {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);

    const json = JSON.stringify(config);
    let encrypted = cipher.update(json, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const payload = `${iv.toString('hex')}:${encrypted}`;
    fs.writeFileSync(path.join(this.basePath, CONFIG_FILE), payload, 'utf8');
  }

  loadConfig(): UserConfig | null {
    const configPath = path.join(this.basePath, CONFIG_FILE);
    if (!fs.existsSync(configPath)) return null;

    try {
      const payload = fs.readFileSync(configPath, 'utf8');
      const [ivHex, encrypted] = payload.split(':');
      if (!ivHex || !encrypted) return null;

      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted) as UserConfig;
    } catch (error) {
      console.error('Failed to decrypt config:', error);
      return null;
    }
  }

  hasConfig(): boolean {
    return fs.existsSync(path.join(this.basePath, CONFIG_FILE));
  }
}
