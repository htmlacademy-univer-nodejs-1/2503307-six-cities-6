import { Request, Response } from 'express';

export interface Controller {
  handleRequest(req: Request, res: Response): Promise<void>;
}
