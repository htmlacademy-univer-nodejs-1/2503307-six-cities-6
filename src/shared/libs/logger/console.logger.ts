import { Logger } from './logger.interface.js';

export class ConsoleLogger implements Logger {
  public debug(message: string, error?: Error): void {
    console.debug(message);
    if (error) {
      console.debug(error);
    }
  }

  public error(message: string, error?: Error): void {
    console.error(message);
    if (error) {
      console.error(error.toString());
    }
  }

  public info(message: string): void {
    console.info(message);
  }

  public warn(message: string, error?: Error): void {
    console.warn(message);
    if (error) {
      console.warn(error.toString());
    }
  }
}
