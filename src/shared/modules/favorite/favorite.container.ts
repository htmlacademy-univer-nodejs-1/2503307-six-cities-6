import { Container } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { FavoriteService } from './favorite-service.interface.js';
import { DefaultFavoriteService } from './default-favorite.service.js';
import { FavoriteModel } from './favorite.entity.js';

const favoriteContainer = new Container();

favoriteContainer.bind<FavoriteService>(Component.FavoriteService).to(DefaultFavoriteService).inSingletonScope();
favoriteContainer.bind(Component.FavoriteModel).toConstantValue(FavoriteModel);

export default favoriteContainer;
