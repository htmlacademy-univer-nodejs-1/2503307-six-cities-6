import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Controller } from './controller.interface.js';
import { Logger } from '../../logger/index.js';
import { Middleware } from '../middleware/middleware.interface.js';
import { injectable, inject } from 'inversify';
import { Component } from '../../../types/index.js';

@injectable()
export abstract class BaseController implements Controller {
  protected middlewares: Middleware[] = [];

  constructor(@inject(Component.Logger) protected readonly logger: Logger) {}

  public addMiddleware(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  public getMiddlewares(): Middleware[] {
    return this.middlewares;
  }

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

  protected conflict(res: Response, message: string = 'Conflict'): void {
    res.status(StatusCodes.CONFLICT).json({
      error: message,
      statusCode: StatusCodes.CONFLICT
    });
  }

  protected internalServerError(res: Response, message: string = 'Internal Server Error'): void {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
}
