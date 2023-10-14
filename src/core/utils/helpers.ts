import { IUser } from "@modules/users";

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
