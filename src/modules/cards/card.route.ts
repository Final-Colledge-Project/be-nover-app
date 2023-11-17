import { Router } from "express";
import CardController from "./card.controller";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import CreateCardDto from "./dtos/createCardDto";
import { Route } from "@core/interfaces";
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
      this.cardController.getCardById
    )
  }
}