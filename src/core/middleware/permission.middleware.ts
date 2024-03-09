import { HttpException } from "@core/exceptions";
import { UserSchema } from "@modules/users";
import { NextFunction, Request, Response } from "express";
const permissionMiddleware =  (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserSchema.findById(req.user.id).select('+role').exec();
    if (!user) {
      return next(
        new HttpException(
          401,
          "The user belonging to this token does no longer exist"
        )
      );
    }
    if (roles.includes(user.role)) {
      next();
    } else {
      next(new HttpException(403, "Permission denied"));
    }
  };
}

export default permissionMiddleware;