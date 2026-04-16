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

  private serializeUser(user: unknown) {
    if (!user || typeof user !== 'object') {
      return user;
    }

    const source = user as Record<string, unknown>;
    const avatarPath = !source.avatarPath || source.avatarPath === 'default-avatar.png'
      ? 'https://api.dicebear.com/9.x/initials/svg?seed=Six%20Cities&backgroundColor=3b82f6'
      : source.avatarPath;

    return {
      id: String(source.id ?? source._id ?? ''),
      email: source.email,
      firstname: source.firstname,
      lastname: source.lastname,
      avatarPath,
      userType: source.userType,
    };
  }

  private serializeComment(comment: Record<string, unknown>) {
    return {
      id: String(comment.id ?? comment._id ?? ''),
      text: comment.text,
      postDate: comment.postDate,
      rating: comment.rating,
      offerId: typeof comment.offerId === 'object' ? (comment.offerId as Record<string, unknown>).id ?? (comment.offerId as Record<string, unknown>)._id : comment.offerId,
      author: this.serializeUser(comment.userId),
    };
  }

  // Создание комментария (POST /api/comments)
  public create = asyncHandler(async (req: Request, res: Response) => {
    const user = res.locals.user;
    const createCommentDto: CreateCommentDto = {
      ...req.body as CreateCommentDto,
      userId: user.id,
      postDate: new Date(),
    };
    const newComment = await this.commentService.create(createCommentDto);
    this.created(res, this.serializeComment(newComment.toObject() as Record<string, unknown>));
  });

  // Получение комментариев для предложения (GET /api/offers/:offerId/comments)
  public index = asyncHandler(async (req: Request, res: Response) => {
    const { offerId } = req.params;
    const comments = await this.commentService.findByOfferId(offerId as string);
    this.ok(res, comments.map((comment) => this.serializeComment(comment.toObject() as Record<string, unknown>)));
  });

  // Получение конкретного комментария (GET /api/comments/:id)
  public show = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const comment = await this.commentService.findById(id as string);

    if (!comment) {
      this.notFound(res, `Comment with id ${id} not found`);
      return;
    }

    this.ok(res, this.serializeComment(comment.toObject() as Record<string, unknown>));
  });
}
