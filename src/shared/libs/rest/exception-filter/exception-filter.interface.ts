import { Request, Response, NextFunction } from 'express';

export interface ExceptionFilter {
  catch(error: Error, req: Request, res: Response, next: NextFunction): void;
}
