import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Controller } from './controller.interface.js';
import { Logger } from '../../logger/index.js';

export abstract class BaseController implements Controller {
  constructor(protected readonly logger: Logger) {}

  public async handleRequest(): Promise<void> {
    // Base implementation - to be overridden
  }

  protected created<T>(res: Response, data: T): void {
    res.status(StatusCodes.CREATED).json(data);
  }

  protected ok<T>(res: Response, data: T): void {
    res.status(StatusCodes.OK).json(data);
  }

  protected noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }

  protected badRequest(res: Response, message: string): void {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: message,
      statusCode: StatusCodes.BAD_REQUEST
    });
  }

  protected notFound(res: Response, message: string = 'Resource not found'): void {
    res.status(StatusCodes.NOT_FOUND).json({
      error: message,
      statusCode: StatusCodes.NOT_FOUND
    });
  }

  protected unauthorized(res: Response, message: string = 'Unauthorized'): void {
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: message,
      statusCode: StatusCodes.UNAUTHORIZED
    });
  }

  protected forbidden(res: Response, message: string = 'Forbidden'): void {
    res.status(StatusCodes.FORBIDDEN).json({
      error: message,
      statusCode: StatusCodes.FORBIDDEN
    });
  }

  protected internalServerError(res: Response, message: string = 'Internal Server Error'): void {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
}
