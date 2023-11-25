import { IUser } from "@modules/users";
import dayjs from "dayjs";
export const isEmptyObject = (obj: Object): boolean => {
  return !Object.keys(obj).length;
};
export const checkUserChangePasswordAfter = (
  user: IUser,
  JWTTimestamp: number
): boolean => {
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (user.passwordChangedAt.getTime() / 1000).toString(),
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
export const generateCardId = (
  workSpaceName: string,
  lengthCard: number
): string => {
  const formatName = workSpaceName.substring(0, 3).toUpperCase();
  return `${formatName}-${lengthCard + 1}`;
};
export const generateSubCardId = (
  cardId: string,
  lengthSubCard: number
): string => {
  return `[${cardId}] ${lengthSubCard + 1}`;
};
export const formatDate = (date: string | Date) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};
