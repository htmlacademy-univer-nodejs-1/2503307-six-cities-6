import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Logger } from '../shared/libs/logger/index.js';
import { Config } from '../shared/libs/config/index.js';

@injectable()
export class Application {
  constructor(
    @inject('Logger') private logger: Logger,
    @inject('Config') private config: Config,
  ) {}

  init(): void {
    this.logger.info('Application initialized');
    this.logger.info(`Server listening on port ${this.config.port}`);
  }
}
