import { Router } from "express";
import BoardPermissionController from "./boardPermission.controller";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import AddBoardPermissionDto from "./dtos/addBoardPermissionDto";
import { Route } from "@core/interfaces";
import UpdateBoardPermissionDto from "./dtos/updateBoardPermissionDto";
export default class BoardPermissionRoute implements Route {
  public path = "/api/v1/board-permissions";
  public router = Router();
  public boardPermissionController = new BoardPermissionController();
  constructor() {
    this.initializeRoute();
  }
  public initializeRoute() {
    this.router.post(
      this.path + "/board/:id",
      validationMiddleware(AddBoardPermissionDto, true),
      authMiddleware,
      this.boardPermissionController.createBoardPermission
    );
    this.router.patch(
      this.path + "/:id",
      validationMiddleware(UpdateBoardPermissionDto, true),
      authMiddleware,
      this.boardPermissionController.updateBoardPermission
    );
    this.router.get(
      this.path + "/board/:id",
      authMiddleware,
      this.boardPermissionController.getBoardPermissionByBoardId
    );
    this.router.get(
      this.path + "/board/:id/user",
      authMiddleware,
      this.boardPermissionController.getBoardPermissionByBoardUser
    );
    this.router.delete(
      this.path + "/:id/board/:boardId",
      authMiddleware,
      this.boardPermissionController.deleteBoardPermission
    );
  }
}
