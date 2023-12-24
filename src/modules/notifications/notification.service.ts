import { HttpException } from "@core/exceptions";
import NotificationSchema from "./notification.model";
import { OBJECT_ID, isEmptyObject } from "@core/utils";
import INotification from "./notification.interface";
import PushNotificationDto from "./dtos/pushNotificationDto";
import { StatusCodes } from "http-status-codes";
export default class NotificationService {
  private notificationSchema = NotificationSchema;
  public async getNotificationsByUserId(userId: string) {
    const notifications = await this.notificationSchema.aggregate([
      {
        $match: {
          receiverId: new OBJECT_ID(userId),
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "senders",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          sender: {
            $arrayElemAt: ["$senders", 0],
          },
          type: 1,
          message: 1,
          targetType: 1,
          contextUrl: 1,
          receiverId: 1,
          isRead: 1,
          isTrash: 1,
          createAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: {
          createAt: -1,
        },
      },
    ]);
    const countAll = notifications.length;
    const countNotRead = notifications.filter((item) => !item.isRead).length;
    return {
      all: countAll,
      unRead: countNotRead,
      data: notifications,
    };
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
  public async markReadNotification(notificationId: string) : Promise<void> {
    if (!notificationId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Notification id is empty");
    }
    const notification = await this.notificationSchema.findById(notificationId);
    if (!notification) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Notification not found");
    }
    notification.isRead = true;
    notification.updatedAt = new Date();
    await notification.save();
  }
  public async markReadAllNotification(userId: string) : Promise<void> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "User id is empty");
    }
    const notifications = await this.notificationSchema.find({ receiverId: userId, isRead: false });
    if (!notifications) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Notification not found");
    }
    notifications.forEach((notification) => {
      notification.isRead = true;
      notification.updatedAt = new Date();
      notification.save();
    });
  } 
}
