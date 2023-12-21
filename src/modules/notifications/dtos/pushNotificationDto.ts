import { ISender } from "../notification.interface";

export default class PushNotificationDto {
  constructor(
    sender: ISender,
    type: string,
    message: string,
    targetType: string,
    contextUrl: string,
    receiverId: string
  ) {
    this.sender = sender;
    this.type = type;
    this.message = message;
    this.targetType = targetType;
    this.contextUrl = contextUrl;
    this.receiverId = receiverId;
  }
  public sender: ISender;
  public type: string;
  public message: string;
  public targetType: string;
  public contextUrl: string;
  public receiverId: string;
}
