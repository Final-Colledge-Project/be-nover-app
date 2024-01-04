import { Route } from "@core/interfaces";
import { Router } from "express";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import NotificationController from "./notification.controller";
export default class NotificationRoute implements Route {
  public path = "/api/v1/notifications";
  public router = Router();
  public notificationController = new NotificationController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.get(
      this.path,
      authMiddleware,
      this.notificationController.getNotificationByUserId
    );
    this.router.patch(
      this.path + "/mark-all",
      authMiddleware,
      this.notificationController.markReadAllNotification
    );
    this.router.patch(
      this.path + "/:id",
      authMiddleware,
      this.notificationController.markReadNotification
    )
   
  }
}
