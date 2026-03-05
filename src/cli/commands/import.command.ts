import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { createOffer, getErrorMessage, getMongoURI } from '../../shared/helpers/index.js';
import { UserService } from '../../shared/modules/user/user-service.interface.js';
import { CategoryModel, CategoryService, DefaultCategoryService } from '../../shared/modules/category/index.js';
import { DefaultOfferService, OfferModel, OfferService } from '../../shared/modules/offer/index.js';
import { DatabaseClient, MongoDatabaseClient } from '../../shared/libs/database-client/index.js';
import { Logger } from '../../shared/libs/logger/index.js';
import { ConsoleLogger } from '../../shared/libs/logger/console.logger.js';
import { DefaultUserService, UserModel } from '../../shared/modules/user/index.js';
import { DEFAULT_DB_PORT } from './command.constant.js';
import { CreateOfferDto } from '../../shared/modules/offer/dto/create-offer.dto.js';

export class ImportCommand implements Command {
  private userService: UserService;
  private categoryService: CategoryService;
  private offerService: OfferService;
  private databaseClient: DatabaseClient;
  private logger: Logger;
  private salt: string = '';

  constructor() {
    this.logger = new ConsoleLogger();
    this.userService = new DefaultUserService(this.logger, UserModel);
    this.categoryService = new DefaultCategoryService(this.logger, CategoryModel);
    this.offerService = new DefaultOfferService(this.logger, OfferModel, CategoryModel);
    this.databaseClient = new MongoDatabaseClient(this.logger);
  }

  public getName(): string {
    return '--import';
  }

  private async saveOffer(offer: CreateOfferDto): Promise<void> {
    const user = await this.userService.findOrCreate({
      email: `user_${Math.random().toString(36).substr(2, 9)}@test.com`,
      firstname: 'User',
      lastname: 'Default',
      avatarPath: 'default-avatar.jpg',
      password: Math.random().toString(36).substr(2, 10)
    }, this.salt);

    if (!offer.categories || offer.categories.length === 0) {
      return;
    }

    const categories = [];
    for (const categoryName of offer.categories) {
      const category = await this.categoryService.findByCategoryNameOrCreate(
        categoryName,
        { name: categoryName, image: 'category.jpg' }
      );
      categories.push(category._id);
    }

    await this.offerService.create({
      ...offer,
      categories: categories.map(cat => cat.toString()),
      userId: user._id.toString()
    });
  }

  private async onImportedLine(line: string): Promise<void> {
    if (!line) {
      return;
    }
    const offer = createOffer(line);
    await this.saveOffer(offer);
  }

  private onCompleteImport(count: number): void {
    console.info(`${count} rows imported.`);
    this.databaseClient.disconnect();
  }

  public async execute(filename: string, login: string, password: string, host: string, dbname: string, salt: string): Promise<void> {
    const uri = getMongoURI(login, password, host, DEFAULT_DB_PORT, dbname);
    this.salt = salt;

    await this.databaseClient.connect(uri);

    const fileReader = new TSVFileReader(filename.trim());

    let count = 0;
    fileReader.on('line', async (line: string) => {
      await this.onImportedLine(line);
      count++;
    });

    fileReader.on('end', () => {
      this.onCompleteImport(count);
    });

    try {
      await fileReader.read();
    } catch (error) {
      console.error(`Can't import data from file: ${filename}`);
      console.error(getErrorMessage(error));
    }
  }
}
