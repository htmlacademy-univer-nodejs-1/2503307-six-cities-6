import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../../libs/rest/controller/base.controller.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { OfferService } from './offer-service.interface.js';
import { FavoriteService } from '../favorite/favorite-service.interface.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
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
    const { limit = 25 } = req.query;
    const offers = await this.offerService.find(Number(limit));

    const user = res.locals.user;

    if (user) {
      const offersWithFavorite = await Promise.all(
        offers.map(async (offer) => {
          const isFavorite = await this.favoriteService.isFavorite(user.id, offer.id);
          return { ...offer.toObject(), isFavorite };
        })
      );
      this.ok(res, offersWithFavorite);
    } else {
      const offersWithFavorite = offers.map((offer) => ({
        ...offer.toObject(),
        isFavorite: false
      }));
      this.ok(res, offersWithFavorite);
    }
  });

  public getOfferById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const offer = await this.offerService.findById(id as string);

    if (!offer) {
      this.notFound(res, `Offer with id ${id} not found`);
      return;
    }

    this.ok(res, offer);
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
}
