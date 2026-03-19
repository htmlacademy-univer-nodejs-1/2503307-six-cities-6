import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { Container } from 'inversify';
import { OfferGenerator } from '../services/offer-generator.js';
import { MockDataFetcher } from '../services/mock-data-fetcher.js';
import { TSVWriter } from '../services/tsv-writer.js';
import { ImportCommand } from './commands/import.command.js';
import { Component } from '../shared/types/index.js';
import { UserService } from '../shared/modules/user/user-service.interface.js';
import { CategoryService } from '../shared/modules/category/index.js';
import { OfferService } from '../shared/modules/offer/index.js';
import { DatabaseClient } from '../shared/libs/database-client/index.js';
import { getMongoURI } from '../shared/helpers/index.js';
import { DEFAULT_DB_PORT } from './commands/command.constant.js';

export const runCLI = async (args: string[], container: Container): Promise<void> => {

  const showHelp = () => {
    console.log(chalk.blue(`
Доступные команды:

--help                                        Показать список команд
--version                                     Показать версию приложения
--import <file> <uri> <salt>                   Импортировать данные (uri - MongoDB connection string)
--import <file> <login> <password> <host>     Импортировать данные (отдельные параметры)
<dbname> <salt> [port]
--generate <n> <filepath> <url>               Сгенерировать тестовые данные
    `));
  };

  const showVersion = () => {
    const packageJSON = JSON.parse(
      fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
    );

    console.log(chalk.green(`Версия: ${packageJSON.version}`));
  };

  const importData = async (importArgs: string[]): Promise<void> => {
    const filePath = importArgs[0];
    const hasUriFormat = importArgs.length >= 3 && importArgs[1]?.startsWith('mongodb');
    const hasMultiFormat = importArgs.length >= 6;

    let uri: string;
    let salt: string;

    if (hasUriFormat) {
      uri = importArgs[1];
      salt = importArgs[2];
    } else if (hasMultiFormat) {
      const [login, password, host] = [importArgs[1], importArgs[2], importArgs[3]];
      const hasPort = importArgs.length >= 7;
      const port = hasPort ? importArgs[4] : DEFAULT_DB_PORT;
      const dbname = hasPort ? importArgs[5] : importArgs[4];
      salt = hasPort ? importArgs[6] : importArgs[5];
      uri = getMongoURI(login, password, host, port, dbname);
    } else {
      console.error(chalk.red('Использование: --import <file> <uri> <salt>'));
      console.error(chalk.red('Или: --import <file> <login> <password> <host> <dbname> <salt> [port]'));
      return;
    }

    if (!filePath || !uri || !salt) {
      console.error(chalk.red('Отсутствуют обязательные параметры'));
      return;
    }

    try {
      const userService = container.get<UserService>(Component.UserService);
      const categoryService = container.get<CategoryService>(Component.CategoryService);
      const offerService = container.get<OfferService>(Component.OfferService);
      const databaseClient = container.get<DatabaseClient>(Component.DatabaseClient);

      const command = new ImportCommand(userService, categoryService, offerService, databaseClient);
      await command.execute(filePath, uri, salt);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Ошибка импорта: ${errorMessage}`));
      throw error;
    }
  };

  const generateData = async (count?: string, filePath?: string, url?: string): Promise<void> => {
    try {
      // Validate arguments
      if (!count || !filePath || !url) {
        console.error(
          chalk.red('Использование: --generate <n: число> <filepath: строка> <url: строка>')
        );
        return;
      }

      const numOffers = parseInt(count, 10);
      if (isNaN(numOffers) || numOffers <= 0) {
        console.error(chalk.red('Количество должно быть положительным числом'));
        return;
      }

      console.log(chalk.yellow(`Получение данных с сервера ${url}...`));

      // Fetch mock data
      const fetcher = new MockDataFetcher(url);
      const mockOffers = await fetcher.fetchOffers();

      if (mockOffers.length === 0) {
        console.error(chalk.red('На сервере не найдено данных'));
        return;
      }

      console.log(chalk.cyan(`Получено ${mockOffers.length} шаблонов данных`));
      console.log(chalk.yellow(`Генерация ${numOffers} предложений...`));

      // Generate offers
      const generator = new OfferGenerator();
      const offers = generator.generateOffers(mockOffers, numOffers);

      // Write to file
      const resolvedPath = path.resolve(filePath);
      await TSVWriter.writeToFile(resolvedPath, offers);

      console.log(chalk.green(`✓ Файл успешно создан: ${resolvedPath}`));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Ошибка генерации: ${errorMessage}`));
    }
  };

  try {
    switch (args[0]) {
      case '--help':
        showHelp();
        break;
      case '--version':
        showVersion();
        break;
      case '--import':
        await importData(args.slice(1));
        break;
      case '--generate':
        await generateData(args[1], args[2], args[3]);
        break;
      default:
        showHelp();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Критическая ошибка: ${errorMessage}`));
    throw new Error(errorMessage);
  }
};

