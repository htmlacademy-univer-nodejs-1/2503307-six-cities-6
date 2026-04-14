import { CreateCommentDto } from './dto/create-comment.dto.js';
import { DocumentType } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';

export interface CommentService {
  create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>>;
  findById(commentId: string): Promise<DocumentType<CommentEntity> | null>;
  findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]>;
  updateById(commentId: string, dto: UpdateCommentDto): Promise<DocumentType<CommentEntity> | null>;
  deleteById(commentId: string): Promise<DocumentType<CommentEntity> | null>;
  deleteByOfferId(offerId: string): Promise<number>;
  calculateOfferRating(offerId: string): Promise<number>;
  updateOfferRating(offerId: string): Promise<void>;
  exists(commentId: string): Promise<boolean>;
}
