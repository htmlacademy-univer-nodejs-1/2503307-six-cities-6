import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { createReadStream } from 'node:fs';
import { OfferGenerator } from '../services/offer-generator.js';
import { MockDataFetcher } from '../services/mock-data-fetcher.js';
import { TSVWriter } from '../services/tsv-writer.js';

export const runCLI = async (args: string[]): Promise<void> => {

  const showHelp = () => {
    console.log(chalk.blue(`
Доступные команды:

--help                              Показать список команд
--version                           Показать версию приложения
--import <file>                     Импортировать данные из TSV файла
--generate <n> <filepath> <url>     Сгенерировать тестовые данные
    `));
  };

  const showVersion = () => {
    const packageJSON = JSON.parse(
      fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
    );

    console.log(chalk.green(`Версия: ${packageJSON.version}`));
  };

  const importData = (filePath?: string): Promise<void> => new Promise((resolve, reject) => {
    if (!filePath) {
      console.error(chalk.red('Укажите путь к файлу.'));
      reject(new Error('No file path provided'));
      return;
    }

    try {
      const resolvedPath = path.resolve(filePath);
      const readStream = createReadStream(resolvedPath, {
        encoding: 'utf-8',
        highWaterMark: 64 * 1024, // 64KB chunks
      });

      let lineCount = 0;
      let buffer = '';

      readStream.on('data', (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        lines.forEach((line) => {
          if (line.trim()) {
            lineCount++;
            if (lineCount % 1000 === 0) {
              console.log(chalk.yellow(`Обработано ${lineCount} записей...`));
            }
          }
        });
      });

      readStream.on('end', () => {
        if (buffer.trim()) {
          lineCount++;
        }
        console.log(chalk.green(`✓ Импортировано ${lineCount} записей`));
        resolve();
      });

      readStream.on('error', (err: NodeJS.ErrnoException) => {
        console.error(chalk.red(`Ошибка чтения файла: ${err.message}`));
        reject(err);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Ошибка: ${errorMessage}`));
      reject(error);
    }
  });

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
        await importData(args[1]);
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

