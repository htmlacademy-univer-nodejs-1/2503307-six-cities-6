import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from '../offer/offer.entity.js';

export interface FavoriteService {
  addToFavorites(userId: string, offerId: string): Promise<void>;
  removeFromFavorites(userId: string, offerId: string): Promise<void>;
  removeByOfferId(offerId: string): Promise<number>;
  getFavoriteOffers(userId: string): Promise<DocumentType<OfferEntity>[]>;
  isFavorite(userId: string, offerId: string): Promise<boolean>;
}
