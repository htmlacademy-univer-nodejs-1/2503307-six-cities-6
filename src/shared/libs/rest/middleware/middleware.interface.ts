import { Request, Response, NextFunction } from 'express';

export interface Middleware {
  execute(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}
