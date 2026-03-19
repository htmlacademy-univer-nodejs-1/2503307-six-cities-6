import { inject, injectable } from 'inversify';
import { FavoriteService } from './favorite-service.interface.js';
import { Component } from '../../types/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { FavoriteEntity } from './favorite.entity.js';
import { Logger } from '../../libs/logger/index.js';
import { OfferEntity } from '../offer/offer.entity.js';

@injectable()
export class DefaultFavoriteService implements FavoriteService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.FavoriteModel) private readonly favoriteModel: types.ModelType<FavoriteEntity>,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>
  ) {}

  public async addToFavorites(userId: string, offerId: string): Promise<void> {
    const existingFavorite = await this.favoriteModel.findOne({ userId, offerId }).exec();

    if (existingFavorite) {
      this.logger.warn(`Offer ${offerId} is already in favorites for user ${userId}`);
      return;
    }

    await this.favoriteModel.create({ userId, offerId });
    await this.offerModel.findByIdAndUpdate(offerId, { isFavorite: true });
    this.logger.info(`Offer ${offerId} added to favorites for user ${userId}`);
  }

  public async removeFromFavorites(userId: string, offerId: string): Promise<void> {
    const result = await this.favoriteModel.deleteOne({ userId, offerId }).exec();

    if (result.deletedCount === 0) {
      this.logger.warn(`Offer ${offerId} was not in favorites for user ${userId}`);
      return;
    }

    const otherFavorites = await this.favoriteModel.find({ offerId }).exec();
    if (otherFavorites.length === 0) {
      await this.offerModel.findByIdAndUpdate(offerId, { isFavorite: false });
    }

    this.logger.info(`Offer ${offerId} removed from favorites for user ${userId}`);
  }

  public async getFavoriteOffers(userId: string): Promise<DocumentType<OfferEntity>[]> {
    const favorites = await this.favoriteModel.find({ userId }).exec();
    const offerIds = favorites.map((fav) => fav.offerId);

    return this.offerModel
      .find({ _id: { $in: offerIds } })
      .populate(['authorId', 'categories'])
      .exec();
  }

  public async isFavorite(userId: string, offerId: string): Promise<boolean> {
    const favorite = await this.favoriteModel.findOne({ userId, offerId }).exec();
    return favorite !== null;
  }
}
