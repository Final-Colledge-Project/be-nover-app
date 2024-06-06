import { Route } from "@core/interfaces";
import { Router } from "express";
import EpicController from "./epic.controller";
import {
  authMiddleware,
  authorizePermission,
  validationMiddleware,
} from "@core/middleware";
import CreateEpicDto from "./dtos/createEpicDto";
import UpdateEpicDto from "./dtos/updateEpicDto";
export default class EpicRoute implements Route {
  public path = "/api/v1/epics";
  public router = Router();
  public epicController = new EpicController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/board/:boardId",
      validationMiddleware(CreateEpicDto, true),
      authMiddleware,
      authorizePermission("epic:create", "board"),
      this.epicController.createEpic
    );
    this.router.patch(
      this.path + "/:id/board/:boardId",
      validationMiddleware(UpdateEpicDto, true),
      authMiddleware,
      authorizePermission("epic:update", "board"),
      this.epicController.updateEpic
    )
  }

}
