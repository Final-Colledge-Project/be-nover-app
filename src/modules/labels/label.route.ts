import { Route } from "@core/interfaces";
import { Router } from "express";
import LabelController from "./label.controller";
import {
  authMiddleware,
  authorizePermission,
  validationMiddleware,
} from "@core/middleware";
import CreateLabelDto from "./dtos/createLabelDto";
import { PERM_TYPE } from "@core/utils";

export default class LabelRoute implements Route {
  public path = "/api/v1/labels";
  public router = Router();
  public labelController = new LabelController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/board/:boardId",
      validationMiddleware(CreateLabelDto, true),
      authMiddleware,
      authorizePermission("label:create", PERM_TYPE.board),
      this.labelController.createLabel
    ),
      this.router.get(
        this.path + "/board/:boardId",
        authMiddleware,
        this.labelController.getLabelsByBoardId
      ),
      this.router.get(
        this.path + "/:id/board/:boardId",
        authMiddleware,
        this.labelController.getLabelById
      );
    this.router.patch(
      this.path + "/:id/board/:boardId",
      authMiddleware,
      authorizePermission("label:update", PERM_TYPE.board),
      this.labelController.updateLabel
    ),
      this.router.delete(
        this.path + "/:id/board/:boardId",
        authMiddleware,
        authorizePermission("label:delete", PERM_TYPE.board),
        this.labelController.deleteLabel
      );
  }
}
