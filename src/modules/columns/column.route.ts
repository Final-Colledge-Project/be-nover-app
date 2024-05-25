import { Route } from "@core/interfaces";
import { Router } from "express";
import ColumnController from "./column.controller";
import {
  authMiddleware,
  authorizePermission,
  validationMiddleware,
} from "@core/middleware";
import CreateColumnDto from "./dtos/createColumnDto";
import UpdateColumnDto from "./dtos/updateColumnDtos";
import { PERM_TYPE } from "@core/utils";
export default class ColumnRoute implements Route {
  public path = "/api/v1/columns";
  public router = Router();
  public columnController = new ColumnController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/board/:boardId",
      validationMiddleware(CreateColumnDto, true),
      authMiddleware,
      authorizePermission("column:create", PERM_TYPE.board),
      this.columnController.createColumn
    );
    this.router.get(
      this.path + "/:id",
      authMiddleware,
      this.columnController.getColumnById
    );
    this.router.get(
      this.path + "/board/:id",
      authMiddleware,
      this.columnController.getColumnByBoardId
    );
    this.router.patch(
      this.path + "/:id/board/:boardId",
      validationMiddleware(UpdateColumnDto, true),
      authMiddleware,
      authorizePermission("column:update", PERM_TYPE.board),
      this.columnController.updateColumn
    );
    this.router.delete(
      this.path + "/:id/board/:boardId",
      authMiddleware,
      authorizePermission("column:delete", PERM_TYPE.board),
      this.columnController.deleteColumn
    );
  }
}
