import { Router } from "express";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import { Route } from "@core/interfaces";
import AddWSPermissionDto from "./dtos/addWSPermissionDto";
import UpdateWSPermissionDto from "./dtos/updateWSPermissionDto";
import WorkspacePermissionController from "./wsPermission.controller";
export default class WorkspacePermissionRoute implements Route {
  public path = "/api/v1/board-permissions";
  public router = Router();
  public wsPermissionController = new WorkspacePermissionController();
  constructor() {
    this.initializeRoute();
  }
  public initializeRoute() {
    this.router.post(
      this.path + "/workspace/:id",
      validationMiddleware(AddWSPermissionDto, true),
      authMiddleware,
      this.wsPermissionController.createWSPermission
    );
    this.router.put(
      this.path + "/:id",
      validationMiddleware(UpdateWSPermissionDto, true),
      authMiddleware,
      this.wsPermissionController.updateWSPermission
    );
    this.router.get(
      this.path + "/workspace/:id",
      authMiddleware,
      this.wsPermissionController.getWSPermissionByWSdId
    );
    this.router.get(
      this.path + "/workspace/:id/user",
      authMiddleware,
      this.wsPermissionController.getWSPermissionByUser
    );
  }
}
