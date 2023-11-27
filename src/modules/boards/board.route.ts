import { Route } from "@core/interfaces";
import BoardController from "./board.controller";
import { Router } from "express";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import CreateBoardDto from "./dtos/createBoardDto";
import UpdateBoardDto from "./dtos/updateBoardDto";

export default class BoardRoute implements Route {
  public path = "/api/v1/boards";
  public router = Router();
  public boardController = new BoardController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path,
      validationMiddleware(CreateBoardDto, true),
      authMiddleware,
      this.boardController.createBoard
    );
    this.router.patch(
      this.path + "/:id/member/:memberId",
      authMiddleware,
      this.boardController.addMemberToBoard
    );
    this.router.get(
      this.path + "/workspace/:id",
      authMiddleware,
      this.boardController.getAllBoardByWorkspaceId
    );
    this.router.get(
      this.path + "/:id",
      authMiddleware,
      this.boardController.getBoardDetail
    );
    this.router.get(
      this.path,
      authMiddleware,
      this.boardController.getAllUserBoard
    );
    this.router.get(
      this.path + "/:id/members",
      authMiddleware,
      this.boardController.getMemberByBoardId
    );
    this.router.patch(
      this.path + "/:id",
      validationMiddleware(UpdateBoardDto, true),
      authMiddleware,
      this.boardController.updateBoard
    )
  }
}
