/**
 * Utility class for random data generation
 * Provides helper methods for creating random values
 */
export class RandomGenerator {
  /**
   * Generate a random integer between min and max (inclusive)
   */
  public static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get a random element from an array
   */
  public static getRandomElement<T>(arr: T[]): T {
    return arr[this.getRandomNumber(0, arr.length - 1)];
  }

  /**
   * Get multiple random elements from an array without repetition
   */
  public static getRandomElements<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
  }

  /**
   * Generate a random decimal number (for rating)
   */
  public static getRandomDecimal(min: number, max: number, decimals = 1): number {
    const num = Math.random() * (max - min) + min;
    return parseFloat(num.toFixed(decimals));
  }

  /**
   * Generate a random ISO date within the last month
   */
  public static getRandomDate(): string {
    const today = new Date();
    const daysAgo = this.getRandomNumber(0, 30);
    today.setDate(today.getDate() - daysAgo);
    return today.toISOString();
  }
}
