import { inject, injectable } from 'inversify';
import express, { Express } from 'express';
import { Logger } from '../shared/libs/logger/index.js';
import { Config, RestSchema } from '../shared/libs/config/index.js';
import { Component } from '../shared/types/index.js';
import { DatabaseClient } from '../shared/libs/database-client/index.js';
import { getMongoURI } from '../shared/helpers/index.js';
import { ExceptionFilter } from '../shared/libs/rest/exception-filter/index.js';
import asyncHandler from 'express-async-handler';
import { SimpleController } from '../shared/libs/rest/controller/simple.controller.js';
import { CommentController } from '../shared/modules/comment/comment.controller.js';
import { UserController } from '../shared/modules/user/user.controller.js';
import { ValidateObjectIdMiddleware } from '../shared/libs/rest/middleware/validate-objectid.middleware.js';
import { ValidateDtoMiddleware } from '../shared/libs/rest/middleware/validate-dto.middleware.js';
import { DocumentExistsMiddleware } from '../shared/libs/rest/middleware/document-exists.middleware.js';
import { UploadFileMiddleware } from '../shared/libs/rest/middleware/upload-file.middleware.js';
import { CreateCommentDto } from '../shared/modules/comment/dto/create-comment.dto.js';
import { OfferService } from '../shared/modules/offer/offer-service.interface.js';
import { UserService } from '../shared/modules/user/user-service.interface.js';

@injectable()
export class RestApplication {
  private readonly server: Express = express();
  private readonly simpleController: SimpleController;
  private readonly commentController: CommentController;
  private readonly userController: UserController;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.ExceptionFilter) private readonly exceptionFilter: ExceptionFilter,
    @inject(Component.CommentController) commentController: CommentController,
    @inject(Component.UserController) userController: UserController,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.UserService) private readonly userService: UserService,
  ) {
    this.simpleController = new SimpleController(logger);
    this.commentController = commentController;
    this.userController = userController;
  }

  private async _initDb() {
    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME'),
    );

    return this.databaseClient.connect(mongoUri);
  }

  private _initMiddleware(): void {
    this.server.use(express.json());
    this.server.use(
      '/upload',
      express.static(this.config.get('UPLOAD_DIRECTORY'))
    );
    this.server.use(asyncHandler((req, _res, next) => {
      this.logger.info(`[${req.method}] ${req.path}`);
      next();
    }));
  }

  private _initRoutes(): void {
    // Register API routes using simple controller
    this.server.get('/api/health', this.simpleController.getHealth);
    this.server.get('/api/offers', this.simpleController.getOffers);
    this.server.get('/api/categories', this.simpleController.getCategories);
    this.server.get('/api/users', this.simpleController.getUsers);
    this.server.get('/api/favorites', this.simpleController.getFavorites);

    // Comments routes with middleware
    const validateOfferId = new ValidateObjectIdMiddleware('offerId');
    const validateCommentId = new ValidateObjectIdMiddleware('id');
    const validateCommentDto = new ValidateDtoMiddleware(CreateCommentDto);

    // POST /api/comments - create comment with DTO validation
    this.server.post('/api/comments', validateCommentDto.execute.bind(validateCommentDto), this.commentController.create);

    // GET /api/offers/:offerId/comments - get comments for offer with ObjectId validation
    this.server.get('/api/offers/:offerId/comments', validateOfferId.execute.bind(validateOfferId), this.commentController.index);

    // GET /api/comments/:id - get specific comment with ObjectId validation
    this.server.get('/api/comments/:id', validateCommentId.execute.bind(validateCommentId), this.commentController.show);

    // Avatar upload route with middleware
    const uploadFileMiddleware = new UploadFileMiddleware(this.config.get('UPLOAD_DIRECTORY'));
    const validateUserId = new ValidateObjectIdMiddleware('userId');
    const documentExistsMiddleware = new DocumentExistsMiddleware(
      this.userService,
      'userId',
      'User',
      this.logger
    );

    // POST /api/users/:userId/avatar - upload avatar
    this.server.post(
      '/api/users/:userId/avatar',
      validateUserId.execute.bind(validateUserId),
      documentExistsMiddleware.execute.bind(documentExistsMiddleware),
      uploadFileMiddleware.execute.bind(uploadFileMiddleware),
      this.userController.uploadAvatar
    );
  }

  private _initExceptionFilters(): void {
    this.server.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.exceptionFilter.catch(error, req, res, next);
    });
  }

  private async _initServer(): Promise<void> {
    const port = this.config.get('PORT');

    this.server.listen(port, () => {
      this.logger.info(`Server started on http://localhost:${port}`);
    });
  }

  public async init() {
    this.logger.info('Application initialization');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);

    this.logger.info('Init database…');
    await this._initDb();
    this.logger.info('Init database completed');

    this.logger.info('Init middleware…');
    this._initMiddleware();
    this.logger.info('Init middleware completed');

    this.logger.info('Init routes…');
    this._initRoutes();
    this.logger.info('Init routes completed');

    this.logger.info('Init exception filters…');
    this._initExceptionFilters();
    this.logger.info('Init exception filters completed');

    this.logger.info('Try to init server…');
    await this._initServer();
    this.logger.info('Server initialized successfully');
  }
}
