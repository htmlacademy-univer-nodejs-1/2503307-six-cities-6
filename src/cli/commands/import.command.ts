import 'dotenv/config.js';
import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { createOffer, getErrorMessage, getMongoURI } from '../../shared/helpers/index.js';
import { UserService } from '../../shared/modules/user/user-service.interface.js';
import { DefaultOfferService, OfferModel, OfferService } from '../../shared/modules/offer/index.js';
import { DatabaseClient, MongoDatabaseClient } from '../../shared/libs/database-client/index.js';
import { Logger } from '../../shared/libs/logger/index.js';
import { ConsoleLogger } from '../../shared/libs/logger/console.logger.js';
import { DefaultUserService, UserModel } from '../../shared/modules/user/index.js';
import { DEFAULT_DB_PORT, DEFAULT_USER_PASSWORD } from './command.constant.js';
import { Offer } from '../../shared/types/index.js';
import { CreateOfferDto } from '../../shared/modules/offer/dto/create-offer.dto.js';

export class ImportCommand implements Command {
  private userService: UserService;
  private offerService: OfferService;
  private databaseClient: DatabaseClient;
  private logger: Logger;
  private salt: string;

  constructor() {
    this.onImportedLine = this.onImportedLine.bind(this);
    this.onCompleteImport = this.onCompleteImport.bind(this);

    this.logger = new ConsoleLogger();
    this.offerService = new DefaultOfferService(this.logger, OfferModel);
    this.userService = new DefaultUserService(this.logger, UserModel);
    this.databaseClient = new MongoDatabaseClient(this.logger);
  }

  private async onImportedLine(line: string, resolve: () => void) {
    const offer = createOffer(line);
    await this.saveOffer(offer);
    resolve();
  }

  private onCompleteImport(count: number) {
    console.info(`${count} rows imported.`);
    this.databaseClient.disconnect();
  }

  private async saveOffer(offer: Offer) {
    const user = await this.userService.findOrCreate({
      ...offer.user,
      password: DEFAULT_USER_PASSWORD,
      userType: 'ordinary',
    }, this.salt);

    await this.offerService.create({
      authorId: user.id,
      title: offer.title,
      description: offer.description,
      city: 'Paris',
      previewImage: offer.image,
      images: [offer.image, offer.image, offer.image, offer.image, offer.image, offer.image],
      isPremium: false,
      rating: 1,
      postDate: offer.postDate,
      price: offer.price,
      type: offer.type,
      rooms: 1,
      guests: 1,
      goods: ['Breakfast'],
      location: {
        latitude: 48.85661,
        longitude: 2.351499
      }
    } as CreateOfferDto & { authorId: string });

  }

  public getName(): string {
    return '--import';
  }

  public async execute(filename: string): Promise<void> {
    const {
      DB_USER = '',
      DB_PASSWORD = '',
      DB_HOST = '127.0.0.1',
      DB_PORT = DEFAULT_DB_PORT,
      DB_NAME = 'six-cities',
      SALT = DEFAULT_USER_PASSWORD,
    } = process.env;

    const uri = getMongoURI(DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME);
    this.salt = SALT;

    await this.databaseClient.connect(uri);

    const fileReader = new TSVFileReader(filename.trim());

    fileReader.on('line', this.onImportedLine);
    fileReader.on('end', this.onCompleteImport);

    try {
      await fileReader.read();
    } catch (error) {
      console.error(`Can't import data from file: ${filename}`);
      console.error(getErrorMessage(error));
    }
  }
}
