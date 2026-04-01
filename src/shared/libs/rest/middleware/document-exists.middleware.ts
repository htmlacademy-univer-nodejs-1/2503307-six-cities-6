import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware.interface.js';
import { BaseController } from '../controller/base.controller.js';
import { Logger } from '../../logger/index.js';

export interface DocumentExistsInterface {
  exists(documentId: string): Promise<boolean>;
}

export class DocumentExistsMiddleware extends BaseController implements Middleware {
  constructor(
    private readonly service: DocumentExistsInterface,
    private readonly paramName: string,
    private readonly entityName: string,
    logger: Logger,
  ) {
    super(logger);
  }

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const documentId = req.params[this.paramName] as string;

    if (!documentId) {
      this.badRequest(res, `Missing parameter: ${this.paramName}`);
      return;
    }

    const exists = await this.service.exists(documentId);

    if (!exists) {
      this.notFound(res, `${this.entityName} with ${this.paramName} ${documentId} not found`);
      return;
    }

    next();
  }
}
