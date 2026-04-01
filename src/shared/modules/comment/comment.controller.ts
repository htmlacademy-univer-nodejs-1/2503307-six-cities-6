import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../../libs/rest/controller/base.controller.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { CommentService } from './comment-service.interface.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import asyncHandler from 'express-async-handler';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService,
  ) {
    super(logger);
  }

  // Создание комментария (POST /api/comments)
  public create = asyncHandler(async (req: Request, res: Response) => {
    const createCommentDto: CreateCommentDto = req.body;
    const newComment = await this.commentService.create(createCommentDto);
    this.created(res, newComment);
  });

  // Получение комментариев для предложения (GET /api/offers/:offerId/comments)
  public index = asyncHandler(async (req: Request, res: Response) => {
    const { offerId } = req.params;
    const comments = await this.commentService.findByOfferId(offerId as string);
    this.ok(res, comments);
  });

  // Получение конкретного комментария (GET /api/comments/:id)
  public show = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const comment = await this.commentService.findById(id as string);

    if (!comment) {
      this.notFound(res, `Comment with id ${id} not found`);
      return;
    }

    this.ok(res, comment);
  });
}
