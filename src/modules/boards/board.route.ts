import { Route } from "@core/interfaces";
import BoardController from "./board.controller";
import { Router } from "express";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import CreateBoardDto from "./dtos/createBoardDto";

export default class BoardRoute implements Route {
  public path = '/api/v1/boards'
  public router = Router()
  public boardController = new BoardController()
  constructor(){
    this.initializeRoute();
  }
  private initializeRoute(){
    this.router.post(
      this.path,
      validationMiddleware(CreateBoardDto, true), 
      authMiddleware,
      this.boardController.createBoard
    )
    this.router.patch(
      this.path + '/:id/member/:memberId',
      authMiddleware,
      this.boardController.addMemberToBoard
    )
  }
}