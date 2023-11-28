import { Route } from "@core/interfaces";
import { Router } from "express";
import ColumnController from "./column.controller";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import CreateColumnDto from "./dtos/createColumnDto";
import UpdateColumnDto from "./dtos/updateColumnDtos";
export default class ColumnRoute implements Route {
  public path = '/api/v1/columns';
  public router = Router();
  public columnController = new ColumnController()
  constructor(){
    this.initializeRoute();
  }
  private initializeRoute(){
    this.router.post(
      this.path,
      validationMiddleware(CreateColumnDto, true),
      authMiddleware,
      this.columnController.createColumn
    )
    this.router.get(
      this.path + '/:id',
      authMiddleware,
      this.columnController.getColumnById
    )
    this.router.get(
      this.path + '/board/:id',
      authMiddleware,
      this.columnController.getColumnByBoardId
    )
    this.router.patch(
      this.path + '/:id',
      validationMiddleware(UpdateColumnDto, true),
      authMiddleware,
      this.columnController.updateColumn
    )
  }
}