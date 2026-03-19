import { CreateOfferDto } from '../modules/offer/dto/create-offer.dto.js';
import { OfferType } from '../types/index.js';

export function createOffer(line: string): CreateOfferDto {
  const parts = line.split('\t');

  return {
    title: parts[0],
    description: parts[1],
    postDate: new Date(parts[2]),
    image: parts[3],
    type: parts[4].toLowerCase() === 'buy' ? OfferType.Buy : OfferType.Sell,
    price: parseInt(parts[5], 10),
    categories: parts[6].split(';').map((cat) => cat.trim()),
    userId: ''
  };
}
