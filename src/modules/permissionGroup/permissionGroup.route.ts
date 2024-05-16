import { Router } from "express";
import PermissionGroupController from "./permission.controller";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import AddPermissionGroupDto from "./dtos/addPermissionGroupDto";
import { Route } from "@core/interfaces";
import UpdatePermissionGroupDto from "./dtos/updatePermissionGroupDtp";
export default class PermissionGroupRoute implements Route {
  public path = "/api/v1/permission-groups";
  public router = Router();
  public permissionGroupController = new PermissionGroupController();
  constructor() {
    this.initializeRoute();
  }
  public initializeRoute() {
    this.router.post(
      this.path,
      validationMiddleware(AddPermissionGroupDto, true),
      authMiddleware,
      this.permissionGroupController.createGroupPermission
    );
    this.router.put(
      this.path + "/:id",
      validationMiddleware(UpdatePermissionGroupDto, true),
      authMiddleware,
      this.permissionGroupController.updateGroupPermission
    );
    this.router.get(
      this.path + "/board/:id",
      authMiddleware,
      this.permissionGroupController.getGroupPermissionByBoardId
    );
    this.router.get(
      this.path + "/board/:id/user",
      authMiddleware,
      this.permissionGroupController.getGroupPermissionByBoardUser
    );
  }
}
