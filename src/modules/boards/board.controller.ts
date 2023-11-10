import { catchAsync } from "@core/utils";
import BoardService from "./board.service";
import { NextFunction, Request, Response } from "express";
import CreateBoardDto from "./dtos/createBoardDto";
export default class BoardController {
  private boardService = new BoardService();
  public createBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user.id;
    const model : CreateBoardDto = req.body;
    const board = await this.boardService.createBoard(model, ownerId);
    res.status(201).json({ data: board, message: "Create board successfully" });
  })
  public addMemberToBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const boardId = req.params.id;
    const memberId = req.params.memberId;
    const board = await this.boardService.addMemberToBoard(userId, boardId, memberId);
    res.status(200).json({ data: board, message: "Add member to board successfully" });
  })
}