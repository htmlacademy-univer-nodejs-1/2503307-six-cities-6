import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { createOffer, getErrorMessage } from '../../shared/helpers/index.js';
import { UserService } from '../../shared/modules/user/user-service.interface.js';
import { CategoryService } from '../../shared/modules/category/index.js';
import { OfferService } from '../../shared/modules/offer/index.js';
import { DatabaseClient } from '../../shared/libs/database-client/index.js';
import { CreateOfferDto } from '../../shared/modules/offer/dto/create-offer.dto.js';

export class ImportCommand implements Command {
  private salt = '';

  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private offerService: OfferService,
    private databaseClient: DatabaseClient,
  ) {}

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
      categories: categories.map((cat) => cat.toString()),
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

  public async execute(filename: string, uri: string, salt: string): Promise<void> {
    this.salt = salt;

    await this.databaseClient.connect(uri);

    const fileReader = new TSVFileReader(filename.trim());
    const linePromises: Promise<void>[] = [];
    let count = 0;

    fileReader.on('line', (line: string) => {
      count++;
      linePromises.push(this.onImportedLine(line));
    });

    const readComplete = new Promise<void>((resolve, reject) => {
      fileReader.on('end', async () => {
        try {
          await Promise.all(linePromises);
          this.onCompleteImport(count);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      fileReader.on('error', reject);
    });

    try {
      await fileReader.read();
      await readComplete;
    } catch (error) {
      console.error(`Can't import data from file: ${filename}`);
      console.error(getErrorMessage(error));
      try {
        await this.databaseClient.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      throw error;
    }
  }
}
