import convict from 'convict';
import { Config } from './config.interface.js';

export function loadConfig(): Config {
  const config = convict<Config>({
    port: {
      doc: 'The port to bind.',
      format: 'port',
      default: 4000,
      env: 'PORT',
    },
    databaseUrl: {
      doc: 'The data base server address (URL or IP).',
      format: (val: string) => {
        // Simple URL validation
        try {
          new URL(val);
        } catch {
          throw new Error('Invalid URL');
        }
      },
      default: 'mongodb://127.0.0.1:27017/six-cities',
      env: 'DATABASE_URL',
    },
    salt: {
      doc: 'Salt for password hashing.',
      format: String,
      default: '',
      env: 'SALT',
    },
  });

  config.load({});

  config.validate({ allowed: 'strict' });

  return config.getProperties();
}
