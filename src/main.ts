import { runCLI } from './cli/cli.js'; // <-- путь к cli.ts после компиляции

const args = process.argv.slice(2);
runCLI(args).catch((error) => {
  console.error('Ошибка:', error);
  throw error;
});

