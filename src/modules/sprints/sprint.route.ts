import { Route } from "@core/interfaces";
import {
  authMiddleware,
  authorizePermission,
  validationMiddleware,
} from "@core/middleware";
import { Router } from "express";
import SprintController from "./sprint.controller";
import CreateSprintDto from "./dtos/createSprintDto";
import { PERM_TYPE } from "@core/utils";

export default class ScheduleRoute implements Route {
  public path = "/api/v1/sprints";
  public router = Router();
  public sprintController = new SprintController();
  constructor() {
    this.initializeRoute();
  }
  public initializeRoute() {
    this.router.post(
      this.path + "/board/:boardId",
      validationMiddleware(CreateSprintDto, true),
      authMiddleware,
      authorizePermission("sprint:create", PERM_TYPE.board),
      this.sprintController.createSprint
    );
    this.router.patch(
      this.path + "/:id/board/:boardId",
      validationMiddleware(CreateSprintDto, true),
      authMiddleware,
      authorizePermission("sprint:update", PERM_TYPE.board),
      this.sprintController.updateSprint
    );
  }
}
