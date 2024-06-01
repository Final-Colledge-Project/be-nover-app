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
  boardName: string,
  lengthCard: number
): string => {
  const formatName = boardName.toUpperCase();
  return `${formatName}-${lengthCard + 1}`;
};
export const generateSubCardId = (
  cardId: string,
  lengthSubCard: number
): string => {
  return `[${cardId}]-${lengthSubCard + 1}`;
};
export const formatDate = (date: string | Date) => {
  return date ? dayjs(date).format("YYYY-MM-DD HH:mm:ss") : null;
};

export const sendMessageToUser = (
  users: Map<any, any>,
  userId: string,
  message: string,
  io: any
) => {
  const socketId = users.get(userId);
  if (socketId) {
    io.to(socketId).emit("directMessage", { message });
    console.log(`Sent a direct message to user ${userId}`);
  } else {
    console.log(`User ${userId} not currently connected`);
  }
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export const isValidObjectId = (id: string) => {
  return id.match(/^[0-9a-fA-F]{24}$/);
};
