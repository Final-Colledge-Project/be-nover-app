import { NextFunction, Request, Response } from 'express';

export default class IndexController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({
        Message: 'Hello word'
      })
    } catch (err) {
      next()
    }
  }
}
