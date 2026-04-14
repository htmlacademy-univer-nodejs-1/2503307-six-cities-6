import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware.interface.js';
import { BaseController } from '../controller/base.controller.js';
import { Logger } from '../../logger/index.js';
import { AuthService } from '../../../modules/auth/auth.service.interface.js';

export class PrivateRouteMiddleware extends BaseController implements Middleware {
  constructor(
    private readonly authService: AuthService,
    logger: Logger
  ) {
    super(logger);
  }

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      this.unauthorized(res, 'Authorization header is required');
      return;
    }

    const [type, token] = authorizationHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      this.unauthorized(res, 'Invalid authorization format. Use Bearer token');
      return;
    }

    const user = await this.authService.verify(token);

    if (!user) {
      this.unauthorized(res, 'Invalid or expired token');
      return;
    }

    res.locals.user = user;
    next();
  }
}
