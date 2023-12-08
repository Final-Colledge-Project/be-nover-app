import { Router } from "express";
import CardController from "./card.controller";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import CreateCardDto from "./dtos/createCardDto";
import { Route } from "@core/interfaces";
import UpdateCardDto from "./dtos/updateCardDto";
export default class CardRoute implements Route {
  public path = '/api/v1/cards';
  public router = Router();
  public cardController = new CardController()
  constructor(){
    this.initializeRoute();
  }
  private initializeRoute(){
    this.router.post(
      this.path,
      validationMiddleware(CreateCardDto, true),
      authMiddleware,
      this.cardController.createCard
    ),
    this.router.get(
      this.path + '/:id',
      authMiddleware,
      this.cardController.getDetailCardById
    ),
    this.router.patch(
      this.path + '/:id/assign-member/:assigneeId',
      authMiddleware,
      this.cardController.assignMemberToCard
    )
    this.router.get(
      this.path + '/:id/members',
      authMiddleware,
      this.cardController.getMemsInCard
    )
    this.router.patch(
      this.path + '/:id',
      validationMiddleware(UpdateCardDto, true),
      authMiddleware,
      this.cardController.updateCard
    )
  }
}