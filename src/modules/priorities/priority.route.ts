import { Route } from "@core/interfaces";
import { Router } from "express";
import PriorityController from "./priority.controller";
import {
  authMiddleware,
  authorizePermission,
  validationMiddleware,
} from "@core/middleware";
import CreatePriorityDto from "./dtos/createPriorityDto";
import { PERM_TYPE } from "@core/utils";
import UpdatePriorityDto from "./dtos/updatePriorityDto";
export default class PriorityRoute implements Route {
  public path = "/api/v1/priorities";
  public router = Router();
  public priorityController = new PriorityController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/board/:boardId",
      validationMiddleware(CreatePriorityDto, true),
      authMiddleware,
      authorizePermission("priority:create", PERM_TYPE.board),
      this.priorityController.createPriority
    );
    this.router.patch(
      this.path + "/:priorityId/board/:boardId",
      validationMiddleware(UpdatePriorityDto, true),
      authMiddleware,
      authorizePermission("priority:update", PERM_TYPE.board),
      this.priorityController.updatePriority
    );
    this.router.delete(
      this.path + "/:priorityId/board/:boardId",
      authMiddleware,
      authorizePermission("priority:delete", PERM_TYPE.board),
      this.priorityController.deletePriority
    );
    this.router.get(
      this.path + "/board/:boardId",
      authMiddleware,
      this.priorityController.getPriorityByBoardId
    );
  }
}
