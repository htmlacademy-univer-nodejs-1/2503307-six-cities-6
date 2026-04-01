import { Request, Response } from 'express';
import { BaseController } from './base.controller.js';
import { Logger } from '../../logger/index.js';
import asyncHandler from 'express-async-handler';

export class SimpleController extends BaseController {
  constructor(logger: Logger) {
    super(logger);
  }

  public getHealth = asyncHandler((_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  public getOffers = asyncHandler((_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Offers endpoint working',
      data: []
    });
  });

  public getCategories = asyncHandler((_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Categories endpoint working',
      data: []
    });
  });

  public getUsers = asyncHandler((_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Users endpoint working',
      data: []
    });
  });

  public getFavorites = asyncHandler((_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Favorites endpoint working',
      data: []
    });
  });
}
