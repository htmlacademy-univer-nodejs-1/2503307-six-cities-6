import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../../libs/rest/controller/base.controller.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { FavoriteService } from './favorite-service.interface.js';
import asyncHandler from 'express-async-handler';

@injectable()
export class FavoriteController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.FavoriteService) private readonly favoriteService: FavoriteService,
  ) {
    super(logger);
  }

  public addToFavorites = asyncHandler(async (req: Request, res: Response) => {
    const { offerId } = req.params;
    const { userId } = req.body;
    
    await this.favoriteService.addToFavorites(userId as string, offerId as string);
    this.ok(res, { message: 'Offer added to favorites' });
  });

  public removeFromFavorites = asyncHandler(async (req: Request, res: Response) => {
    const { offerId } = req.params;
    const { userId } = req.body;
    
    await this.favoriteService.removeFromFavorites(userId as string, offerId as string);
    this.ok(res, { message: 'Offer removed from favorites' });
  });

  public getFavorites = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const favorites = await this.favoriteService.getFavoriteOffers(userId as string);
    
    this.ok(res, favorites);
  });

  public checkIsFavorite = asyncHandler(async (req: Request, res: Response) => {
    const { userId, offerId } = req.params;
    
    const isFavorite = await this.favoriteService.isFavorite(userId as string, offerId as string);
    
    this.ok(res, { isFavorite });
  });
}
