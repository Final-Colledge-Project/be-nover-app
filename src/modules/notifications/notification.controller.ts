import { NextFunction, Request, Response } from "express";
import { catchAsync } from "@core/utils";
import { StatusCodes } from "http-status-codes";

import NotificationService from "./notification.service";

export default class NotificationController {
  private notificationService = new NotificationService();
  public getNotificationByUserId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const notifications = await this.notificationService.getNotificationsByUserId(req.user.id);
    res.status(StatusCodes.CREATED).json({data: notifications, message: "Get notification successfully" });
  })
}