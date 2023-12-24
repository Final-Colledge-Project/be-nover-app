import { NextFunction, Request, Response } from "express";
import { catchAsync } from "@core/utils";
import { StatusCodes } from "http-status-codes";

import NotificationService from "./notification.service";

export default class NotificationController {
  private notificationService = new NotificationService();
  public getNotificationByUserId = catchAsync(async (req: Request, res: Response) => {
    const notifications = await this.notificationService.getNotificationsByUserId(req.user.id);
    res.status(StatusCodes.OK).json({data: notifications, message: "Get notification successfully" });
  })
  public markReadNotification = catchAsync(async (req: Request, res: Response) => {
    const notificationId = req.params.id;
    await this.notificationService.markReadNotification(notificationId);
    res.status(StatusCodes.OK).json({message: "Mark read notification successfully" });
  })
  public markReadAllNotification = catchAsync(async (req: Request, res: Response) => {
    await this.notificationService.markReadAllNotification(req.user.id);
    res.status(StatusCodes.OK).json({message: "Mark read all notification successfully" });
  })
} 