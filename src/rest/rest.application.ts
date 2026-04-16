import { inject, injectable } from 'inversify';
import express, { Express } from 'express';
import cors from 'cors';
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
import { FavoriteController } from '../shared/modules/favorite/favorite.controller.js';
import { OfferController } from '../shared/modules/offer/offer.controller.js';
import { ValidateObjectIdMiddleware } from '../shared/libs/rest/middleware/validate-objectid.middleware.js';
import { ValidateDtoMiddleware } from '../shared/libs/rest/middleware/validate-dto.middleware.js';
import { DocumentExistsMiddleware } from '../shared/libs/rest/middleware/document-exists.middleware.js';
import { UploadFileMiddleware } from '../shared/libs/rest/middleware/upload-file.middleware.js';
import { PrivateRouteMiddleware } from '../shared/libs/rest/middleware/private-route.middleware.js';
import { OptionalAuthMiddleware } from '../shared/libs/rest/middleware/optional-auth.middleware.js';
import { CreateCommentDto } from '../shared/modules/comment/dto/create-comment.dto.js';
import { CreateOfferDto } from '../shared/modules/offer/dto/create-offer.dto.js';
import { LoginDto } from '../shared/modules/auth/dto/login.dto.js';
import { CommentService } from '../shared/modules/comment/comment-service.interface.js';
import { AuthService } from '../shared/modules/auth/auth.service.interface.js';
import { CreateUserDto } from '../shared/modules/user/dto/create-user.dto.js';
import { UpdateOfferDto } from '../shared/modules/offer/dto/update-offer.dto.js';
import { UpdateUserDto } from '../shared/modules/user/dto/update-user.dto.js';

@injectable()
export class RestApplication {
  private readonly server: Express = express();
  private readonly simpleController: SimpleController;
  private readonly commentController: CommentController;
  private readonly userController: UserController;
  private readonly favoriteController: FavoriteController;
  private readonly offerController: OfferController;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.ExceptionFilter) private readonly exceptionFilter: ExceptionFilter,
    @inject(Component.CommentController) commentController: CommentController,
    @inject(Component.UserController) userController: UserController,
    @inject(Component.FavoriteController) favoriteController: FavoriteController,
    @inject(Component.OfferController) offerController: OfferController,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.AuthService) private readonly authService: AuthService,
  ) {
    this.simpleController = new SimpleController(logger);
    this.commentController = commentController;
    this.userController = userController;
    this.favoriteController = favoriteController;
    this.offerController = offerController;
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
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use('/static', express.static('markup/img'));
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

    // Middleware instances
    const optionalAuthMiddleware = new OptionalAuthMiddleware(this.authService);
    const privateRouteMiddleware = new PrivateRouteMiddleware(this.authService, this.logger);
    const validateOfferId = new ValidateObjectIdMiddleware('id');

    // Offers routes
    // GET /api/offers - list offers (optional auth for isFavorite)
    this.server.get(
      '/api/offers',
      optionalAuthMiddleware.execute.bind(optionalAuthMiddleware),
      this.offerController.getOffers
    );

    // GET /api/offers/:id - get offer details (optional auth for isFavorite)
    this.server.get(
      '/api/offers/:id',
      validateOfferId.execute.bind(validateOfferId),
      optionalAuthMiddleware.execute.bind(optionalAuthMiddleware),
      this.offerController.getOfferById
    );

    // POST /api/offers - create offer (only authorized)
    const validateCreateOfferDto = new ValidateDtoMiddleware(CreateOfferDto);
    const validateUpdateOfferDto = new ValidateDtoMiddleware(UpdateOfferDto);
    this.server.post(
      '/api/offers',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      validateCreateOfferDto.execute.bind(validateCreateOfferDto),
      this.offerController.createOffer
    );

    // PATCH /api/offers/:id - update offer (only authorized, own offer)
    this.server.patch(
      '/api/offers/:id',
      validateOfferId.execute.bind(validateOfferId),
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      validateUpdateOfferDto.execute.bind(validateUpdateOfferDto),
      this.offerController.updateOffer
    );

    // DELETE /api/offers/:id - delete offer (only authorized, own offer)
    this.server.delete(
      '/api/offers/:id',
      validateOfferId.execute.bind(validateOfferId),
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      this.offerController.deleteOffer
    );

    // GET /api/offers/premium/:city - premium offers for city
    this.server.get(
      '/api/offers/premium/:city',
      optionalAuthMiddleware.execute.bind(optionalAuthMiddleware),
      this.offerController.getPremiumOffers
    );

    this.server.get('/api/users', this.simpleController.getUsers);
    const validateCreateUserDto = new ValidateDtoMiddleware(CreateUserDto);
    this.server.post(
      '/api/users',
      optionalAuthMiddleware.execute.bind(optionalAuthMiddleware),
      validateCreateUserDto.execute.bind(validateCreateUserDto),
      this.userController.createUser
    );
    const validateUpdateUserDto = new ValidateDtoMiddleware(UpdateUserDto);

    // Comments routes with middleware
    const validateOfferIdParam = new ValidateObjectIdMiddleware('offerId');
    const validateCommentId = new ValidateObjectIdMiddleware('id');
    const validateCommentDto = new ValidateDtoMiddleware(CreateCommentDto);

    // Login/Logout routes
    const validateLoginDto = new ValidateDtoMiddleware(LoginDto);
    this.server.post('/api/auth/login', validateLoginDto.execute.bind(validateLoginDto), this.userController.login);
    this.server.post(
      '/api/auth/logout',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      this.userController.logout
    );

    // POST /api/comments - create comment with DTO validation (protected route)
    this.server.post(
      '/api/comments',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      validateCommentDto.execute.bind(validateCommentDto),
      this.commentController.create
    );

    // GET /api/offers/:offerId/comments - get comments for offer with ObjectId validation
    this.server.get('/api/offers/:offerId/comments', validateOfferIdParam.execute.bind(validateOfferIdParam), this.commentController.index);

    // Получение конкретного комментария (GET /api/comments/:id)
    // Document existence is checked by middleware
    const commentExistsMiddleware = new DocumentExistsMiddleware(
      this.commentService,
      'id',
      'Comment',
      this.logger
    );
    this.server.get(
      '/api/comments/:id',
      validateCommentId.execute.bind(validateCommentId),
      commentExistsMiddleware.execute.bind(commentExistsMiddleware),
      this.commentController.show
    );

    // Avatar upload route (protected)
    const uploadFileMiddleware = new UploadFileMiddleware(this.config.get('UPLOAD_DIRECTORY'));

    // POST /api/users/avatar - upload avatar (user ID from token)
    this.server.post(
      '/api/users/avatar',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      uploadFileMiddleware.execute.bind(uploadFileMiddleware),
      this.userController.uploadAvatar
    );

    // GET /api/users/me - get current user (protected)
    this.server.get(
      '/api/users/me',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      this.userController.getCurrentUser
    );
    this.server.patch(
      '/api/users/me',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      validateUpdateUserDto.execute.bind(validateUpdateUserDto),
      this.userController.updateCurrentUser
    );

    // Favorites routes (protected)
    // POST /api/favorites/:offerId - add to favorites
    this.server.post(
      '/api/favorites/:offerId',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      this.favoriteController.addToFavorites
    );

    // DELETE /api/favorites/:offerId - remove from favorites
    this.server.delete(
      '/api/favorites/:offerId',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      this.favoriteController.removeFromFavorites
    );

    // GET /api/favorites - get user favorites
    this.server.get(
      '/api/favorites',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      this.favoriteController.getFavorites
    );

    // GET /api/favorites/:offerId/check - check if offer is favorite
    this.server.get(
      '/api/favorites/:offerId/check',
      privateRouteMiddleware.execute.bind(privateRouteMiddleware),
      this.favoriteController.checkIsFavorite
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
