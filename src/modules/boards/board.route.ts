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
      this.path + '/workspace/:id',
      validationMiddleware(CreateBoardDto, true), 
      authMiddleware,
      this.boardController.createBoard
    )
  }
}