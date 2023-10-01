import { RequestHandler, Request, Response, NextFunction } from "express";

const validationMiddleware = (type: any, skipMissingProp = false) : RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
      
  }
}