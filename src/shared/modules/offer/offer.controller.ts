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
import { CommentService } from '../comment/comment-service.interface.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.FavoriteService) private readonly favoriteService: FavoriteService,
    @inject(Component.CommentService) private readonly commentService: CommentService,
  ) {
    super(logger);
  }

  private serializeUser(user: unknown) {
    if (!user || typeof user !== 'object') {
      return user;
    }

    const source = user as Record<string, unknown>;
    const rawId = source.id ?? source._id ?? '';
    const avatarPath = !source.avatarPath || source.avatarPath === 'default-avatar.png'
      ? 'https://api.dicebear.com/9.x/initials/svg?seed=Six%20Cities&backgroundColor=3b82f6'
      : source.avatarPath;

    return {
      id: typeof rawId === 'object' && rawId !== null && 'toString' in rawId ? String((rawId as {toString(): string}).toString()) : String(rawId),
      email: source.email,
      firstname: source.firstname,
      lastname: source.lastname,
      avatarPath,
      userType: source.userType,
    };
  }

  private serializeOfferSummary(offer: DocumentType<OfferEntity> | Record<string, unknown>) {
    const source = 'toObject' in offer ? (offer as DocumentType<OfferEntity>).toObject() as Record<string, unknown> : offer as Record<string, unknown>;

    return {
      id: String(source.id ?? source._id ?? ''),
      title: source.title,
      postDate: source.postDate,
      city: source.city,
      previewImage: source.previewImage,
      isPremium: source.isPremium,
      isFavorite: source.isFavorite,
      rating: source.rating,
      type: source.type,
      price: source.price,
      commentCount: source.commentCount,
    };
  }

  private serializeOfferDetails(offer: DocumentType<OfferEntity> | Record<string, unknown>) {
    const source = 'toObject' in offer ? (offer as DocumentType<OfferEntity>).toObject() as Record<string, unknown> : offer as Record<string, unknown>;

    return {
      id: String(source.id ?? source._id ?? ''),
      title: source.title,
      description: source.description,
      postDate: source.postDate,
      city: source.city,
      previewImage: source.previewImage,
      images: source.images,
      isPremium: source.isPremium,
      isFavorite: source.isFavorite,
      rating: source.rating,
      type: source.type,
      rooms: source.rooms,
      guests: source.guests,
      price: source.price,
      goods: source.goods,
      author: this.serializeUser(source.authorId),
      commentCount: source.commentCount,
      location: source.location,
    };
  }

  public getOffers = asyncHandler(async (req: Request, res: Response) => {
    const { limit = DEFAULT_OFFER_COUNT } = req.query;
    const offers = await this.offerService.find(Number(limit));
    const user = res.locals.user;
    const offersWithFavorite = await this.enrichWithFavorite(offers, user);
    this.ok(res, offersWithFavorite.map((offer) => this.serializeOfferSummary(offer)));
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

    this.ok(res, this.serializeOfferDetails({ ...offer.toObject(), isFavorite }));
  });

  public createOffer = asyncHandler(async (req: Request, res: Response) => {
    const user = res.locals.user;
    const createOfferDto: CreateOfferDto = {
      ...req.body as CreateOfferDto,
      authorId: user.id,
    };
    const newOffer = await this.offerService.create(createOfferDto);
    this.created(res, this.serializeOfferDetails(newOffer));
  });

  public updateOffer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateOfferDto: UpdateOfferDto = req.body;
    const user = res.locals.user;

    const offer = await this.offerService.findById(id as string);
    if (!offer) {
      this.notFound(res, `Offer with id ${id} not found`);
      return;
    }

    const authorId = typeof offer.authorId === 'object' ? offer.authorId.id : String(offer.authorId);
    if (authorId !== user.id) {
      this.forbidden(res, 'You can edit only your own offers');
      return;
    }

    const updatedOffer = await this.offerService.updateById(id as string, updateOfferDto);

    if (!updatedOffer) {
      this.notFound(res, `Offer with id ${id} not found`);
      return;
    }

    this.ok(res, this.serializeOfferDetails(updatedOffer));
  });

  public deleteOffer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = res.locals.user;

    const offer = await this.offerService.findById(id as string);
    if (!offer) {
      this.notFound(res, `Offer with id ${id} not found`);
      return;
    }

    const authorId = typeof offer.authorId === 'object' ? String(offer.authorId.id) : String(offer.authorId);
    const canDelete = authorId === user.id || user.userType === 'pro';

    if (!canDelete) {
      this.forbidden(res, 'You can delete only your own offers unless you are a pro user');
      return;
    }

    await this.commentService.deleteByOfferId(id as string);
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
    this.ok(res, offersWithFavorite.map((offer) => this.serializeOfferSummary(offer)));
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
