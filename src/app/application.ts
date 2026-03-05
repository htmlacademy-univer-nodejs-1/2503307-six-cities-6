import 'reflect-metadata';
import { injectable, inject, Container } from 'inversify';
import { Logger } from '../shared/libs/logger/index.js';
import { Config } from '../shared/libs/config/index.js';
import { Component } from '../shared/types/index.js';
import { runCLI } from '../cli/cli.js';

@injectable()
export class Application {
  constructor(
    @inject(Component.Logger) private logger: Logger,
    @inject(Component.Config) private config: Config,
  ) {}

  async run(args: string[], container: Container): Promise<void> {
    // Run CLI if arguments are provided
    if (args.length > 0) {
      try {
        await runCLI(args, container);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`CLI Error: ${errorMessage}`);
        throw error;
      }
      return;
    }

    // Normal application initialization
    this.init();
  }

  init(): void {
    this.logger.info('Application initialized');
    this.logger.info(`Server listening on port ${this.config.port}`);
  }
}
