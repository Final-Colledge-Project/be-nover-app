import { Request, Response, NextFunction } from "express";
import Logger from "@core/utils/logger";
import { HttpException } from "@core/exceptions";

const errorMiddleWare = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status: number = error.status || 500;
  const message: string = error.message || "Something went wrong";

  Logger.error(`[Error] - Status: ${status}, Message: ${message}`);
  res.status(status).json({
    message: message,
  });
};

export default errorMiddleWare;
