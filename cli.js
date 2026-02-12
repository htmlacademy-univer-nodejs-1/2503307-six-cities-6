#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";

// Получаем аргументы командной строки
const [, , command, filePath] = process.argv;

// Считываем package.json для версии
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));

// Текст помощи
const HELP_TEXT = `
${chalk.blue("--help")}       - Показать список команд
${chalk.blue("--version")}    - Показать версию приложения
${chalk.blue("--import <file>")} - Импортировать данные из TSV файла
`;

function showHelp() {
  console.log(HELP_TEXT);
}

function showVersion() {
  console.log(`Версия: ${chalk.green(packageJson.version)}`);
}

function importData(file) {
  const fullPath = path.resolve(file);
  if (!fs.existsSync(fullPath)) {
    console.error(chalk.red(`Файл ${file} не найден`));
    return;
  }

  const content = fs.readFileSync(fullPath, "utf-8").trim();
  const [headerLine, ...lines] = content.split("\n");
  const headers = headerLine.split("\t");

  const offers = lines.map(line => {
    const values = line.split("\t");
    const offer = {};
    headers.forEach((h, i) => (offer[h] = values[i]));
    return offer;
  });

  console.log(chalk.yellow("Импортированные предложения:"));
  offers.forEach((o, idx) => {
    console.log(chalk.cyan(`#${idx + 1}`), o);
  });
}

// Обработка команд
switch (command) {
  case "--help":
  case undefined:
    showHelp();
    break;
  case "--version":
    showVersion();
    break;
  case "--import":
    if (!filePath) {
      console.error(chalk.red("Укажите путь к файлу TSV"));
      break;
    }
    importData(filePath);
    break;
  default:
    console.error(chalk.red(`Неизвестная команда: ${command}`));
    showHelp();
}
