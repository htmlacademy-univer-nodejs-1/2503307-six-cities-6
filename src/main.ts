import 'dotenv/config.js';
import 'reflect-metadata';
import { createContainer } from './shared/libs/container/container.js';
import { Application } from './app/application.js';

const container = createContainer();
const application = container.get<Application>(Application);

// Get CLI arguments (skip node and script path)
const cliArgs = process.argv.slice(2);

// Run application with CLI arguments
await application.run(cliArgs, container);


