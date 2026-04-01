import { inject, injectable } from 'inversify';
import { CommentService } from './comment-service.interface.js';
import { Component } from '../../types/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { Logger } from '../../libs/logger/index.js';
import { OfferEntity } from '../offer/offer.entity.js';

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>
  ) {}

  public async create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>> {
    const comment = await this.commentModel.create(dto);
    await this.updateOfferRating(dto.offerId);
    await this.offerModel.findByIdAndUpdate(dto.offerId, {'$inc': {commentCount: 1}});
    this.logger.info(`New comment created for offer ${dto.offerId}`);
    return comment.populate('userId');
  }

  public async findById(commentId: string): Promise<DocumentType<CommentEntity> | null> {
    return this.commentModel
      .findById(commentId)
      .populate(['userId', 'offerId'])
      .exec();
  }

  public async findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]> {
    return this.commentModel
      .find({offerId})
      .populate('userId')
      .exec();
  }

  public async updateById(commentId: string, dto: UpdateCommentDto): Promise<DocumentType<CommentEntity> | null> {
    const comment = await this.commentModel
      .findByIdAndUpdate(commentId, dto, {new: true})
      .populate(['userId', 'offerId'])
      .exec();

    if (comment) {
      await this.updateOfferRating(comment.offerId.toString());
      this.logger.info(`Comment ${commentId} updated`);
    }

    return comment;
  }

  public async deleteById(commentId: string): Promise<DocumentType<CommentEntity> | null> {
    const comment = await this.commentModel.findByIdAndDelete(commentId).exec();

    if (comment) {
      await this.updateOfferRating(comment.offerId.toString());
      await this.offerModel.findByIdAndUpdate(comment.offerId, {'$inc': {commentCount: -1}});
      this.logger.info(`Comment ${commentId} deleted`);
    }

    return comment;
  }

  public async deleteByOfferId(offerId: string): Promise<number> {
    const result = await this.commentModel
      .deleteMany({offerId})
      .exec();

    await this.offerModel.findByIdAndUpdate(offerId, {commentCount: 0});
    this.logger.info(`All comments for offer ${offerId} deleted`);
    return result.deletedCount;
  }

  public async calculateOfferRating(offerId: string): Promise<number> {
    const comments = await this.commentModel.find({offerId}).exec();

    if (comments.length === 0) {
      return 1;
    }

    const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
    return Math.round((totalRating / comments.length) * 10) / 10;
  }

  public async updateOfferRating(offerId: string): Promise<void> {
    const newRating = await this.calculateOfferRating(offerId);
    await this.offerModel.findByIdAndUpdate(offerId, {rating: newRating});
  }

  public async exists(commentId: string): Promise<boolean> {
    const comment = await this.commentModel.exists({ _id: commentId });
    return comment !== null;
  }
}
