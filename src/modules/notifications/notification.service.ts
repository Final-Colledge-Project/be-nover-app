import { HttpException } from "@core/exceptions";
import NotificationSchema from "./notification.model";
import { isEmptyObject } from "@core/utils";
import INotification from "./notification.interface";
import PushNotificationDto from "./dtos/pushNotificationDto";
import { StatusCodes } from "http-status-codes";
export default class NotificationService {
  private notificationSchema = NotificationSchema;
  public async getNotificationsByUserId(
    userId: string
  ): Promise<INotification[]> {
    const notifications = await this.notificationSchema
      .find({ receiverId: userId }).sort({ createAt: -1 })
      .exec();
    return notifications;
  }
  public async pushMultiNotification(
    model: PushNotificationDto[]
  ): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const notis = await this.notificationSchema.insertMany(model);
    if (!notis) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "Notifications not created"
      );
    }
  }
  public async pushNotification(model: PushNotificationDto): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const newNotification = await this.notificationSchema.create({ ...model });
    if (!newNotification) {
      throw new HttpException(StatusCodes.CONFLICT, "Notification not created");
    }
  }
}
