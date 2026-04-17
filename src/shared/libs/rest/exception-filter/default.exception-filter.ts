import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ExceptionFilter } from './exception-filter.interface.js';
import { Logger } from '../../logger/index.js';
import { injectable, inject } from 'inversify';
import { Component } from '../../../types/index.js';

@injectable()
export class DefaultExceptionFilter implements ExceptionFilter {
  constructor(@inject(Component.Logger) private readonly logger: Logger) {}

  public catch(error: Error, req: Request, res: Response, _next: NextFunction): void {
    this.logger.error(`[${req.method}] ${req.path} — Error: ${error.message}`, error);

    // Handle different types of errors
    if (this.isValidationError(error)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: error.message,
        message: error.message,
        statusCode: StatusCodes.BAD_REQUEST
      });
      return;
    }

    if (this.isNotFoundError(error)) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: 'Resource Not Found',
        details: error.message,
        statusCode: StatusCodes.NOT_FOUND
      });
      return;
    }

    if (this.isUnauthorizedError(error)) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        details: error.message,
        statusCode: StatusCodes.UNAUTHORIZED
      });
      return;
    }

    // Default: Internal Server Error
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal Server Error',
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }

  private isValidationError(error: Error): boolean {
    return error.message.includes('validation') ||
           error.message.includes('required') ||
           error.message.includes('invalid');
  }

  private isNotFoundError(error: Error): boolean {
    return error.message.includes('not found') ||
           error.message.includes('does not exist');
  }

  private isUnauthorizedError(error: Error): boolean {
    return error.message.includes('unauthorized') ||
           error.message.includes('access denied') ||
           error.message.includes('forbidden');
  }
}
