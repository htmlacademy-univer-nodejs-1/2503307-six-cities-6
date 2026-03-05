import * as fs from 'node:fs';
import { EventEmitter } from 'node:events';

const DEFAULT_CHUNK_SIZE = 16 * 1024; // 16KB

export class TSVFileReader extends EventEmitter {
  constructor(private readonly filename: string) {
    super();
  }

  public async read(): Promise<void> {
    const stream = fs.createReadStream(this.filename, {
      highWaterMark: DEFAULT_CHUNK_SIZE,
      encoding: 'utf-8',
    });

    let lineBuffer = '';
    let lineNumber = 0;

    stream.on('data', (chunk: string) => {
      lineBuffer += chunk;

      const lines = lineBuffer.split('\n');

      lineBuffer = lines[lines.length - 1];

      for (let i = 0; i < lines.length - 1; i++) {
        lineNumber++;
        this.emit('line', lines[i]);
      }
    });

    stream.on('end', () => {
      if (lineBuffer.length > 0) {
        lineNumber++;
        this.emit('line', lineBuffer);
      }

      this.emit('end', lineNumber);
    });

    stream.on('error', (error: NodeJS.ErrnoException) => {
      throw error;
    });
  }
}
