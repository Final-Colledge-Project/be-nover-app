import { DataStoredInToken, TokenData } from "@modules/auth";
import { RefreshTokenSchema } from "@modules/refresh_token";
import { IUser } from "@modules/users";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Logger from "./logger";
import { HttpException } from "@core/exceptions";

export const isEmptyObject = (obj: Object): boolean => {
  return !Object.keys(obj).length;
};

export const checkUserChangePasswordAfter = (
  user: IUser,
  JWTTimestamp: number
): boolean => {
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt((user.passwordChangedAt.getTime() / 1000).toString(), 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};


export const randomTokenString = () : string => {
  return crypto.randomBytes(40).toString('hex');
}

