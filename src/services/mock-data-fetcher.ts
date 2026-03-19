import { MockOffer } from '../types/mock-offer.type.js';
import got from 'got';

/**
 * Service for fetching mock data from JSON server
 */
export class MockDataFetcher {
  constructor(private readonly url: string) {}

  /**
   * Fetch all offers from the mock server
   */
  public async fetchOffers(): Promise<MockOffer[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await got(`${this.url}/offers`);

      let data;
      try {
        data = JSON.parse(response.body || response);
      } catch {
        data = response.body || response;
      }

      // Handle both direct array and {offers: array} formats
      if (Array.isArray(data)) {
        return data as MockOffer[];
      }

      if (data && typeof data === 'object' && 'offers' in data) {
        return (data as { offers: MockOffer[] }).offers;
      }

      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch mock data: ${errorMessage}`);
    }
  }
}
