import { OfferType } from './offer-type.enum.js';
import { User } from './user.type.js';

export type Offer = {
  title: string;
  description: string;
  postDate: Date;
  image: string;
  type: OfferType
  price: number;
  user: User;
}
