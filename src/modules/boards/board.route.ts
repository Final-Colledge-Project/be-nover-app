import { Route } from "@core/interfaces";
import BoardController from "./board.controller";
import { Router } from "express";
import {
  authMiddleware,
  authorizePermission,
  uploadSingleImage,
  validationMiddleware,
} from "@core/middleware";
import CreateBoardDto from "./dtos/createBoardDto";
import UpdateBoardDto from "./dtos/updateBoardDto";
import AddMemsToBoardDto from "./dtos/addMemsToBoard";
import { PERM_TYPE } from "@core/utils";

export default class BoardRoute implements Route {
  public path = "/api/v1/boards";
  public router = Router();
  public boardController = new BoardController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/workspace/:wsId",
      validationMiddleware(CreateBoardDto, true),
      authMiddleware,
      authorizePermission("board:create", PERM_TYPE.workspace),
      this.boardController.createBoard
    );
    this.router.patch(
      this.path + "/:boardId/members",
      validationMiddleware(AddMemsToBoardDto, true),
      authMiddleware,
      authorizePermission("member:invite", PERM_TYPE.board),
      this.boardController.addMemberToBoard
    );
    this.router.get(
      this.path + "/workspace/:wsId",
      authMiddleware,
      this.boardController.getAllBoardByWorkspaceId
    );
    this.router.get(
      this.path + "/:boardId",
      authMiddleware,
      this.boardController.getBoardDetail
    );
    this.router.get(
      this.path,
      authMiddleware,
      this.boardController.getAllUserBoard
    );
    this.router.get(
      this.path + "/:boardId/members",
      authMiddleware,
      this.boardController.getMemberByBoardId
    );
    this.router.patch(
      this.path + "/:boardId",
      validationMiddleware(UpdateBoardDto, true),
      authMiddleware,
      this.boardController.updateBoard
    );
    this.router.patch(
      this.path + "/grand-ba/:id/members/:memberId",
      authMiddleware,
      this.boardController.grandBoardAdmin
    );
    this.router.delete(
      this.path + "/revoke-ba/:id/members/:memberId",
      authMiddleware,
      this.boardController.revokeBoardAdmin
    );
    this.router.patch(
      this.path + "/:id/upload-cover",
      authMiddleware,
      uploadSingleImage("cover"),
      this.boardController.uploadCoverBoard
    );
    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      this.boardController.deleteBoard
    );
    this.router.delete(
      this.path + "/:id/members/:memberId",
      authMiddleware,
      this.boardController.deleteMemberFromBoard
    );
    this.router.get(
      this.path + "/:boardId/issues",
      authMiddleware,
      this.boardController.getAllIssueInBoardDetail
    );
  }
}
