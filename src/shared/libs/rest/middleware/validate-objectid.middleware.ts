import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware.interface.js';
import { BaseController } from '../controller/base.controller.js';
import { Logger } from '../../logger/index.js';

export class ValidateObjectIdMiddleware extends BaseController implements Middleware {
  constructor(private readonly paramName: string) {
    super({} as Logger); // Логгер будет внедрен через DI в контроллере
  }

  public execute(req: Request, res: Response, next: NextFunction): void {
    const id = req.params[this.paramName] as string;

    if (!id || !this.isValidObjectId(id)) {
      this.badRequest(res, `Invalid ${this.paramName}: ${id}`);
      return;
    }

    next();
  }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}
