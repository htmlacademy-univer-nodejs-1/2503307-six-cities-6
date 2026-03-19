import { RandomGenerator } from '../../utils/random-generator.js';

export function getRandomItem<T>(items: T[]): T {
  return RandomGenerator.getRandomElement(items);
}

export function getRandomItems<T>(items: T[]): T[] {
  const startPosition = RandomGenerator.getRandomNumber(0, items.length - 1);
  const endPosition = startPosition + RandomGenerator.getRandomNumber(startPosition, items.length);
  return items.slice(startPosition, endPosition);
}

export function generateRandomValue(min: number, max: number, numAfterDigit = 0) {
  return +((Math.random() * (max - min)) + min).toFixed(numAfterDigit);
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

export * from './database.js';
export * from './hash.js';
export * from './offer.js';
