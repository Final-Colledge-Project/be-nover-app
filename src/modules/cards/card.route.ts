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
export default class CardRoute implements Route {
  public path = "/api/v1/cards";
  public router = Router();
  public cardController = new CardController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path,
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
        this.path + "/:id/assign-member/:assigneeId",
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
      this.path + "/:id",
      validationMiddleware(UpdateCardDto, true),
      authMiddleware,
      authorizePermission("card:update", PERM_TYPE.board),
      this.cardController.updateCard
    );
    this.router.patch(
      this.path + "/:id/upload-cover",
      authMiddleware,
      uploadSingleImage("cover"),
      authorizePermission("card:update", PERM_TYPE.board),
      this.cardController.uploadCoverCard
    );
    this.router.patch(
      this.path + "/:id/unassign-member/:assigneeId",
      authMiddleware,
      authorizePermission("card:update", PERM_TYPE.board),
      this.cardController.unAssignMemberFromCard
    );
    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      authorizePermission("card:delete", PERM_TYPE.board),
      this.cardController.deleteCard
    );
  }
}
