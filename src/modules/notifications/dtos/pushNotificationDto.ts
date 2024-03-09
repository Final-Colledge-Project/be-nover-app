import { ISender, IType } from "../notification.interface";

export default class PushNotificationDto {
  constructor(
    senderId: string,
    type: IType,
    message: string,
    targetType: string,
    contextUrl: string,
    receiverId: string
  ) {
    this.senderId = senderId;
    this.type = type;
    this.message = message;
    this.targetType = targetType;
    this.contextUrl = contextUrl;
    this.receiverId = receiverId;
  }
  public senderId: string;
  public type: IType;
  public message: string;
  public targetType: string;
  public contextUrl: string;
  public receiverId: string;
}
