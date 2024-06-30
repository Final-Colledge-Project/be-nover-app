import { Router } from "express";
import CardController from "./card.controller";
import {
  authMiddleware,
  authorizePermission,
  uploadSingleImage,
  validationMiddleware,
} from "@core/middleware";
import CreateCardDto from "./dtos/createCardDto";
import { Route } from "@core/interfaces";
import UpdateCardDto from "./dtos/updateCardDto";
import { PERM_TYPE } from "@core/utils";
import AssignMemDto from "./dtos/assignedMemDto";
import AddCommentDto from "./dtos/addCommentDto";
export default class CardRoute implements Route {
  public path = "/api/v1/cards";
  public router = Router();
  public cardController = new CardController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/board/:boardId",
      validationMiddleware(CreateCardDto, true),
      authMiddleware,
      authorizePermission("card:create", PERM_TYPE.board),
      this.cardController.createCard
    ),
      this.router.get(
        this.path + "/assigned-me",
        authMiddleware,
        this.cardController.assignedToMe
      ),
      this.router.get(
        this.path + "/:id",
        authMiddleware,
        this.cardController.getDetailCardById
      ),
      this.router.patch(
        this.path + "/:id/assign-member/board/:boardId",
        validationMiddleware(AssignMemDto, true),
        authMiddleware,
        authorizePermission("card:update", PERM_TYPE.board),
        this.cardController.assignMemberToCard
      );

    this.router.get(
      this.path + "/:id/members",
      authMiddleware,
      this.cardController.getMemsInCard
    );
    this.router.patch(
      this.path + "/:id/board/:boardId",
      validationMiddleware(UpdateCardDto, true),
      authMiddleware,
      authorizePermission("card:update", PERM_TYPE.board),
      this.cardController.updateCard
    );
    this.router.patch(
      this.path + "/:id/upload-cover/board/:boardId",
      authMiddleware,
      uploadSingleImage("cover"),
      authorizePermission("card:update", PERM_TYPE.board),
      this.cardController.uploadCoverCard
    );
    this.router.patch(
      this.path + "/:id/unassign-member/board/:boardId",
      authMiddleware,
      authorizePermission("card:update", PERM_TYPE.board),
      this.cardController.unAssignMemberFromCard
    );
    this.router.delete(
      this.path + "/:id/board/:boardId",
      authMiddleware,
      authorizePermission("card:delete", PERM_TYPE.board),
      this.cardController.deleteCard
    );
    this.router.post(
      this.path + "/:cardId/comments/board/:boardId",
      authMiddleware,
      validationMiddleware(AddCommentDto, true),
      authorizePermission(
        "card:create,card:update,card:delete",
        PERM_TYPE.board
      ),
      this.cardController.addCommentToCard
    );
    this.router.get(
      this.path + "/:cardId/comments/board/:boardId",
      authMiddleware,
      authorizePermission(
        "card:create,card:update,card:delete",
        PERM_TYPE.board
      ),
      this.cardController.getCommentsInCard
    );
    this.router.patch(
      this.path + "/:cardId/comments/:commentId/board/:boardId",
      validationMiddleware(AddCommentDto, true),
      authMiddleware,
      authorizePermission(
        "card:create,card:update,card:delete",
        PERM_TYPE.board
      ),
      this.cardController.updateCommentInCard
    );
    this.router.delete(
      this.path + "/:cardId/comments/:commentId/board/:boardId",
      authMiddleware,
      authorizePermission(
        "card:create,card:update,card:delete",
        PERM_TYPE.board
      ),
      this.cardController.deleteCommentInCard
    );
  }
}
