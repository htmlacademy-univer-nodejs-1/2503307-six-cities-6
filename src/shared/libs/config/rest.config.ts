import { config } from 'dotenv';
import { inject, injectable } from 'inversify';
import { Config } from './config.interface.js';
import { Logger } from '../logger/index.js';
import { configRestSchema, RestSchema } from './rest.schema.js';
import { Component } from '../../types/index.js';

@injectable()
export class RestConfig implements Config<RestSchema> {
  private readonly config: RestSchema;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger
  ) {
    const parsedOutput = config();

    if (parsedOutput.error) {
      throw new Error('Can\'t read .env file. Perhaps the file does not exists.');
    }

    const requiredEnvKeys: (keyof RestSchema)[] = [
      'PORT',
      'SALT',
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'DB_PORT',
      'DB_NAME',
      'UPLOAD_DIRECTORY',
      'JWT_SECRET',
    ];

    const missingKeys = requiredEnvKeys.filter((key) => {
      const value = process.env[key];
      return value === undefined || value === null || value === '';
    });

    if (missingKeys.length > 0) {
      throw new Error(`Required env variables are missing: ${missingKeys.join(', ')}`);
    }

    configRestSchema.load({});
    configRestSchema.validate({ allowed: 'strict', output: this.logger.info });

    this.config = configRestSchema.getProperties();
    this.logger.info('.env file found and successfully parsed!');
  }

  public get<T extends keyof RestSchema>(key: T): RestSchema[T] {
    return this.config[key];
  }
}
