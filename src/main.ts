import 'dotenv/config.js';
import 'reflect-metadata';
import { createContainer } from './shared/libs/container/container.js';
import { Application } from './app/application.js';

const container = createContainer();
const application = container.get<Application>(Application);

application.init();


