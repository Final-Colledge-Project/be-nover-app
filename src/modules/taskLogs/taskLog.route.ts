import { Route } from "@core/interfaces";
import { Router } from "express";
import TaskLogController from "./taskLog.controller";
import { authMiddleware } from "@core/middleware";
export default class TaskLogRoute implements Route {
  public path = "/api/v1/task-logs";
  public router = Router();
  public taskLogController = new TaskLogController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.get(
      this.path + "/board/:boardId",
      authMiddleware,
      this.taskLogController.getTaskLogs
    );
  }
}
