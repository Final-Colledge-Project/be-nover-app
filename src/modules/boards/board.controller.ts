import { catchAsync } from "@core/utils";
import BoardService from "./board.service";
import { NextFunction, Request, Response } from "express";
import CreateBoardDto from "./dtos/createBoardDto";
export default class BoardController {
  private boardService = new BoardService();
  public createBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user.id;
    const teamWorkspaceId = req.params.id;
    const model : CreateBoardDto = req.body;
    const board = await this.boardService.createBoard(model, ownerId, teamWorkspaceId);
    res.status(201).json({ data: board, message: "Create board successfully" });
  })
  
}