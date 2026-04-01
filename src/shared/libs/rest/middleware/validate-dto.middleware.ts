import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Middleware } from './middleware.interface.js';
import { BaseController } from '../controller/base.controller.js';
import { Logger } from '../../logger/index.js';

export class ValidateDtoMiddleware extends BaseController implements Middleware {
  constructor(private readonly DtoClass: new () => object) {
    super({} as Logger); // Логгер будет внедрен через DI в контроллере
  }

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = plainToInstance(this.DtoClass, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors.map((error) => Object.values(error.constraints || {})).flat();
      this.badRequest(res, `Validation failed: ${errorMessages.join(', ')}`);
      return;
    }

    req.body = dto; // Заменяем тело запроса на валидированный DTO
    next();
  }
}
