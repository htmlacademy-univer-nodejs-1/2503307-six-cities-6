import { Container } from 'inversify';
import { Controller } from '../../libs/rest/controller/controller.interface.js';
import { OfferController } from './offer.controller.js';
import { Component } from '../../types/index.js';
import { OfferService } from './offer-service.interface.js';
import { DefaultOfferService } from './default-offer.service.js';
import { OfferModel } from './offer.entity.js';
import { Logger, PinoLogger } from '../../libs/logger/index.js';

export function createOfferContainer() {
  const container = new Container();

  container.bind<OfferService>(Component.OfferService).to(DefaultOfferService).inSingletonScope();
  container.bind<Controller>(Component.OfferController).to(OfferController).inSingletonScope();
  container.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();
  container.bind<typeof OfferModel>(Component.OfferModel).toConstantValue(OfferModel);

  return container;
}
