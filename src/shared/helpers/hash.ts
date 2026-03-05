import * as crypto from 'node:crypto';

export function createSHA256(line: string, salt: string): string {
  const shasum = crypto.createHmac('sha256', salt);
  shasum.update(line);
  return shasum.digest('hex');
}
