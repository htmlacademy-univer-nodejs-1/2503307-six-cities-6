import { Offer, City } from '../types/offer.type.js';
import { MockOffer } from '../types/mock-offer.type.js';
import { RandomGenerator } from '../utils/random-generator.js';

/**
 * Service for generating random offer data based on mock templates
 */
export class OfferGenerator {
  private readonly cities: City[] = [
    'Paris',
    'Cologne',
    'Brussels',
    'Amsterdam',
    'Hamburg',
    'Dusseldorf',
  ];

  private readonly propertyTypes: Array<'apartment' | 'house' | 'room' | 'hotel'> = [
    'apartment',
    'house',
    'room',
    'hotel',
  ];

  private readonly facilitiesPool = [
    'Wi-Fi',
    'TV',
    'Kitchen',
    'Washing machine',
    'Swimming pool',
    'Parking',
    'Air conditioning',
    'Bar',
    'Concierge',
    'Gym',
    'Balcony',
  ];

  /**
   * Generate a single offer based on template
   */
  public generateOffer(template: MockOffer): Offer {
    return {
      title: this.generateTitle(template.title),
      description: this.generateDescription(template.description),
      postDate: RandomGenerator.getRandomDate(),
      city: RandomGenerator.getRandomElement(this.cities),
      previewImage: template.previewImage,
      images: RandomGenerator.getRandomElements(template.images, RandomGenerator.getRandomNumber(2, 4)),
      isPremium: Math.random() > 0.5,
      isFavorite: false,
      rating: RandomGenerator.getRandomDecimal(3.5, 5.0),
      type: RandomGenerator.getRandomElement(this.propertyTypes),
      rooms: RandomGenerator.getRandomNumber(1, 5),
      guests: RandomGenerator.getRandomNumber(1, 10),
      price: RandomGenerator.getRandomNumber(25, 500),
      facilities: RandomGenerator.getRandomElements(
        this.facilitiesPool,
        RandomGenerator.getRandomNumber(2, 6)
      ),
      author: this.generateAuthorName(template.author),
    };
  }

  /**
   * Generate multiple offers
   */
  public generateOffers(templates: MockOffer[], count: number): Offer[] {
    const offers: Offer[] = [];
    for (let i = 0; i < count; i++) {
      const template = RandomGenerator.getRandomElement(templates);
      offers.push(this.generateOffer(template));
    }
    return offers;
  }

  private generateTitle(_baseTitle: string): string {
    const adjectives = ['Beautiful', 'Cozy', 'Charming', 'Modern', 'Luxury', 'Spacious'];
    const types = ['apartment', 'house', 'room', 'hotel'];
    const adjective = RandomGenerator.getRandomElement(adjectives);
    const type = RandomGenerator.getRandomElement(types);
    return `${adjective} ${type}`;
  }

  private generateDescription(_baseDescription: string): string {
    const descriptions = [
      'A wonderful place to stay',
      'Perfect for travelers',
      'Comfortable and affordable',
      'Excellent location with great amenities',
      'Ideal for families and groups',
      'Modern and well-equipped',
    ];
    return RandomGenerator.getRandomElement(descriptions);
  }

  private generateAuthorName(_baseName: string): string {
    const firstNames = [
      'John',
      'Jane',
      'Bob',
      'Alice',
      'Charlie',
      'Diana',
      'Edward',
      'Fiona',
    ];
    const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Evans', 'Miller', 'Garcia'];
    const firstName = RandomGenerator.getRandomElement(firstNames);
    const lastName = RandomGenerator.getRandomElement(lastNames);
    return `${firstName} ${lastName}`;
  }
}
