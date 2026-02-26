import { Container } from 'inversify';
import { Logger, PinoLogger } from '../logger/index.js';
import { Config, loadConfig } from '../config/index.js';
import { Application } from '../../../app/application.js';

export function createContainer(): Container {
  const container = new Container();

  // Load and bind configuration
  const config = loadConfig();
  container.bind<Config>('Config').toConstantValue(config);

  // Bind logger
  container.bind<Logger>('Logger').to(PinoLogger).inSingletonScope();

  // Bind application
  container.bind<Application>(Application).toSelf().inSingletonScope();

  return container;
}
