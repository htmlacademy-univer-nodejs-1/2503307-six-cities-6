import { Container } from 'inversify';
import { Logger, PinoLogger } from '../logger/index.js';
import { Config, loadConfig } from '../config/index.js';
import { Application } from '../../../app/application.js';
import { DatabaseClient, MongoDatabaseClient } from '../database-client/index.js';
import { Component } from '../../types/index.js';
import { UserService } from '../../modules/user/user-service.interface.js';
import { DefaultUserService, UserEntity, UserModel } from '../../modules/user/index.js';
import { CategoryService } from '../../modules/category/category-service.interface.js';
import { DefaultCategoryService, CategoryEntity, CategoryModel } from '../../modules/category/index.js';
import { OfferService } from '../../modules/offer/offer-service.interface.js';
import { DefaultOfferService, OfferEntity, OfferModel } from '../../modules/offer/index.js';
import { types } from '@typegoose/typegoose';

export function createContainer(): Container {
  const container = new Container();

  // Load and bind configuration
  const config = loadConfig();
  container.bind<Config>(Component.Config).toConstantValue(config);

  // Bind logger
  container.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();

  // Bind database client
  container.bind<DatabaseClient>(Component.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();

  // Bind models
  container.bind<types.ModelType<UserEntity>>(Component.UserModel).toConstantValue(UserModel);
  container.bind<types.ModelType<CategoryEntity>>(Component.CategoryModel).toConstantValue(CategoryModel);
  container.bind<types.ModelType<OfferEntity>>(Component.OfferModel).toConstantValue(OfferModel);

  // Bind services
  container.bind<UserService>(Component.UserService).to(DefaultUserService).inSingletonScope();
  container.bind<CategoryService>(Component.CategoryService).to(DefaultCategoryService).inSingletonScope();
  container.bind<OfferService>(Component.OfferService).to(DefaultOfferService).inSingletonScope();

  // Bind application
  container.bind<Application>(Application).toSelf().inSingletonScope();

  return container;
}
