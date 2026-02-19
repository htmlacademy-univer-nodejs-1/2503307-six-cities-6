import { runCLI } from './cli/cli.js'; // <-- путь к cli.ts после компиляции

const args = process.argv.slice(2); // все аргументы после "node dist/main.js"
runCLI(args);
