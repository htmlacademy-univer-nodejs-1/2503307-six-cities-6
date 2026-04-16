import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { DocumentType } from '@typegoose/typegoose';
import { BaseController } from '../../libs/rest/controller/base.controller.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { OfferService } from './offer-service.interface.js';
import { FavoriteService } from '../favorite/favorite-service.interface.js';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DEFAULT_OFFER_COUNT } from './offer.constant.js';
import asyncHandler from 'express-async-handler';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.FavoriteService) private readonly favoriteService: FavoriteService,
  ) {
    super(logger);
  }

  public getOffers = asyncHandler(async (req: Request, res: Response) => {
    const { limit = DEFAULT_OFFER_COUNT } = req.query;
    const offers = await this.offerService.find(Number(limit));
    const user = res.locals.user;
    const offersWithFavorite = await this.enrichWithFavorite(offers, user);
    this.ok(res, offersWithFavorite);
  });

  public getOfferById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const offer = await this.offerService.findById(id as string);

    if (!offer) {
      this.notFound(res, `Offer with id ${id} not found`);
      return;
    }

    const user = res.locals.user;
    let isFavorite = false;

    if (user) {
      isFavorite = await this.favoriteService.isFavorite((user as { id: string }).id, offer.id);
    }

    this.ok(res, { ...offer.toObject(), isFavorite });
  });

  public createOffer = asyncHandler(async (req: Request, res: Response) => {
    const createOfferDto: CreateOfferDto = req.body;
    const newOffer = await this.offerService.create(createOfferDto);
    this.created(res, newOffer);
  });

  public updateOffer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateOfferDto: UpdateOfferDto = req.body;

    const updatedOffer = await this.offerService.updateById(id as string, updateOfferDto);

    if (!updatedOffer) {
      this.notFound(res, `Offer with id ${id} not found`);
      return;
    }

    this.ok(res, updatedOffer);
  });

  public deleteOffer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedOffer = await this.offerService.deleteById(id as string);

    if (!deletedOffer) {
      this.notFound(res, `Offer with id ${id} not found`);
      return;
    }

    this.noContent(res);
  });

  public getPremiumOffers = asyncHandler(async (req: Request, res: Response) => {
    const { city } = req.params;
    const premiumOffers = await this.offerService.findPremiumByCity(city as string);
    const user = res.locals.user;
    const offersWithFavorite = await this.enrichWithFavorite(premiumOffers, user);
    this.ok(res, offersWithFavorite);
  });

  protected async enrichWithFavorite(offers: DocumentType<OfferEntity>[], user?: unknown) {
    if (!user) {
      return offers.map((offer: DocumentType<OfferEntity>) => ({
        ...offer.toObject(),
        isFavorite: false
      }));
    }

    return Promise.all(
      offers.map(async (offer: DocumentType<OfferEntity>) => {
        const isFavorite = await this.favoriteService.isFavorite((user as { id: string }).id, offer.id);
        return { ...offer.toObject(), isFavorite };
      })
    );
  }
}
