import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware.interface.js';
import { AuthService } from '../../../modules/auth/auth.service.interface.js';

export class OptionalAuthMiddleware implements Middleware {
  constructor(private readonly authService: AuthService) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader) {
      const [type, token] = authorizationHeader.split(' ');

      if (type === 'Bearer' && token) {
        const user = await this.authService.verify(token);
        if (user) {
          res.locals.user = user;
        }
      }
    }

    next();
  }
}
