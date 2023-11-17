import { HttpException } from '@core/exceptions';
import { Logger } from '@core/utils';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler, Request, Response, NextFunction } from 'express';

const validationMiddleware = (type: any, skipMissingProperties = false): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    validate(plainToInstance(type, req.body), { skipMissingProperties }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const messages = errors
          .map((error: ValidationError) => {
            return Object.values(error.constraints!);
          })
          .join(', ');
        next(new HttpException(400, messages));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;
