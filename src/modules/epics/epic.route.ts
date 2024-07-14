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
import AddCommentDto from "./dtos/addCommentDto";
import { PERM_TYPE } from "@core/utils";
import UpdateCommentDto from "./dtos/updateCommentDto";
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
    ),
      this.router.get(
        this.path + "/:id/board/:boardId",
        authMiddleware,
        this.epicController.getDetailEpicById
      );
    this.router.get(
      this.path + "/board/:boardId",
      authMiddleware,
      this.epicController.getEpicsByBoardId
    );
    this.router.post(
      this.path + "/:id/comments/board/:boardId",
      authMiddleware,
      validationMiddleware(AddCommentDto, true),
      authorizePermission(
        "epic:create,epic:update,epic:delete",
        PERM_TYPE.board
      ),
      this.epicController.addCommentToEpic
    );
    this.router.get(
      this.path + "/:id/comments/board/:boardId",
      authMiddleware,
      authorizePermission(
        "epic:create,epic:update,epic:delete",
        PERM_TYPE.board
      ),
      this.epicController.getCommentsInEpic
    );
    this.router.patch(
      this.path + "/:id/comments/:commentId/board/:boardId",
      validationMiddleware(UpdateCommentDto, true),
      authMiddleware,
      authorizePermission(
        "epic:create,epic:update,epic:delete",
        PERM_TYPE.board
      ),
      this.epicController.updateCommentInEpic
    );
    this.router.delete(
      this.path + "/:id/comments/:commentId/board/:boardId",
      authMiddleware,
      authorizePermission(
        "epic:create,epic:update,epic:delete",
        PERM_TYPE.board
      ),
      this.epicController.deleteCommentInEpic
    );
  }
}
