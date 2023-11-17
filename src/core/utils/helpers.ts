import crypto from 'crypto'

import { IUser } from '@modules/users'

export const isEmptyObject = (obj: Object): boolean => {
  return !Object.keys(obj).length;
};

export const checkUserChangePasswordAfter = (user: IUser, JWTTimestamp: number): boolean => {
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt((user.passwordChangedAt.getTime() / 1000).toString(), 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export const generateCardId = (workSpaceName: string, lengthCard: number): string => {
  const formatName = workSpaceName.substring(0, 3).toUpperCase();
  return `${formatName}-${lengthCard + 1}`;
}
