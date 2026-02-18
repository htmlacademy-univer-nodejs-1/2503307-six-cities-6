import fs from "fs";
import path from "path";
import chalk from "chalk";

export const runCLI = (args: string[]): void => {

  const showHelp = () => {
    console.log(chalk.blue(`
Доступные команды:

--help                Показать список команд
--version             Показать версию приложения
--import <file>       Импортировать данные из TSV файла
    `));
  };

  const showVersion = () => {
    const packageJSON = JSON.parse(
      fs.readFileSync(new URL("../../package.json", import.meta.url), "utf-8")
    );

    console.log(chalk.green(`Версия: ${packageJSON.version}`));
  };

  const importData = (filePath?: string) => {
    if (!filePath) {
      console.error(chalk.red("Укажите путь к файлу."));
      return;
    }

    try {
      const data = fs.readFileSync(path.resolve(filePath), "utf-8");
      const rows = data.trim().split("\n");

      console.log(chalk.yellow(`Импортировано ${rows.length} записей:`));

      rows.forEach((row, index) => {
        const fields = row.split("\t");
        console.log(chalk.cyan(`#${index + 1}`), fields[0]);
      });

    } catch {
      console.error(chalk.red("Ошибка чтения файла"));
    }
  };

  switch (args[0]) {
    case "--help":
      showHelp();
      break;
    case "--version":
      showVersion();
      break;
    case "--import":
      importData(args[1]);
      break;
    default:
      showHelp();
  }
};
