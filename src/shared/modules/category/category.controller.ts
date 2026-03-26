import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../../libs/rest/controller/base.controller.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import asyncHandler from 'express-async-handler';

@injectable()
export class CategoryController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
  ) {
    super(logger);
  }

  public getCategories = asyncHandler(async (_req: Request, res: Response) => {
    // Since CategoryService doesn't have find method, we'll return empty array for now
    this.ok(res, []);
  });

  public getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Since CategoryService doesn't have findById method, we'll return not found for now
    this.notFound(res, `Category with id ${id} not found`);
  });

  public createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    // Since CategoryService doesn't have create method, we'll return mock response for now
    this.created(res, { id: 'mock-id', name });
  });
}
