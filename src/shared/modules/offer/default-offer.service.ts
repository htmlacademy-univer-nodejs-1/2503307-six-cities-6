import { inject, injectable } from 'inversify';
import { OfferService } from './offer-service.interface.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DEFAULT_OFFER_COUNT } from './offer.constant.js';
import { CategoryEntity } from '../category/category.entity.js';
import { Types } from 'mongoose';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(Component.CategoryModel) private readonly categoryModel: types.ModelType<CategoryEntity>
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const categoriesIds = Array.isArray(dto.categories) ? dto.categories : [dto.categories];
    const foundCategories = await this.categoryModel.find({ _id: { $in: categoriesIds }});
    if (foundCategories.length !== categoriesIds.length) {
      throw new Error('Some categories not exists');
    }

    const offerData = {
      title: dto.title,
      description: dto.description,
      postDate: dto.postDate,
      type: dto.type,
      price: dto.price,
      image: dto.image,
      categories: foundCategories.map((cat) => cat._id),
      userId: new Types.ObjectId(dto.userId)
    };

    const result = await this.offerModel.create(offerData);
    this.logger.info(`New offer created: ${dto.title}`);

    return result;
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findById(offerId)
      .populate(['userId', 'categories'])
      .exec();
  }

  public async find(): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .populate(['userId', 'categories'])
      .exec();
  }

  public async deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndDelete(offerId)
      .exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    const updateData = { ...dto };
    if (dto.categories) {
      const categoriesIds = Array.isArray(dto.categories) ? dto.categories : [dto.categories];
      const foundCategories = await this.categoryModel.find({ _id: { $in: categoriesIds }});
      if (foundCategories.length !== categoriesIds.length) {
        throw new Error('Some categories not exists');
      }
      (updateData as Record<string, unknown>).categories = foundCategories.map((cat) => cat._id);
    }

    return this.offerModel
      .findByIdAndUpdate(offerId, updateData, {new: true})
      .populate(['userId', 'categories'])
      .exec();
  }

  public async findByCategoryId(categoryId: string, count?: number): Promise<DocumentType<OfferEntity>[]> {
    const limit = count ?? DEFAULT_OFFER_COUNT;
    return this.offerModel
      .find({categories: categoryId}, {}, {limit})
      .populate(['userId', 'categories'])
      .exec();
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.offerModel
      .exists({_id: documentId})) !== null;
  }

  public async incCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, {'$inc': {
        commentCount: 1,
      }}).exec();
  }

  public async findNew(count: number): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .sort({ createdAt: -1 })
      .limit(count)
      .populate(['userId', 'categories'])
      .exec();
  }

  public async findDiscussed(count: number): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .sort({ commentCount: -1 })
      .limit(count)
      .populate(['userId', 'categories'])
      .exec();
  }
}
