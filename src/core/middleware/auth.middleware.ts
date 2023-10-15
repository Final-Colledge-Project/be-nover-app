import { HttpException } from "@core/exceptions";
import { checkUserChangePasswordAfter } from "@core/utils/helpers";
import { DataStoredInToken } from "@modules/auth";
import { UserSchema } from "@modules/users";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type Decoded = {
  id: string;
  iat: number;
  exp: number;
};

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //1. Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new HttpException(
        401,
        "You are not logged in! Please log in to get access"
      )
    );
  }

  //2. Verification token
  const decoded: Decoded = (await jwtVerifyPromisified(
    token,
    process.env.JWT_TOKEN_SECRET!
  )) as Decoded;

  //3. Check if user still exists
  const currentUser = await UserSchema.findById(decoded?.id);

  if (!currentUser) {
    return next(
      new HttpException(
        401,
        "The user belonging to this token does no longer exist"
      )
    );
  }

  //4. Check if user changed password after the token was issued
  if (checkUserChangePasswordAfter(currentUser, decoded.iat)) {
    return next(
      new HttpException(
        401,
        "User recently changed password! Please log in again"
      )
    );
  }
  //grant access to protected route
  if (!req.user) {
    req.user = { id: "" };
  }
  req.user.id = currentUser.id;
  next();
};

const jwtVerifyPromisified = (token: string, secret: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, {}, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
};

export default authMiddleware;
