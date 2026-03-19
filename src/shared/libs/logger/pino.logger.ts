import pino from 'pino';
import { injectable } from 'inversify';
import { Logger } from './logger.interface.js';

@injectable()
export class PinoLogger implements Logger {
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = pino();
  }

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug({ args }, message);
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info({ args }, message);
  }

  warn(message: string, ...args: unknown[]): void {
    this.logger.warn({ args }, message);
  }

  error(message: string, ...args: unknown[]): void {
    this.logger.error({ args }, message);
  }
}
