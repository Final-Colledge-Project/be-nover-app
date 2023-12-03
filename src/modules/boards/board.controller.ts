import { catchAsync } from "@core/utils";
import BoardService from "./board.service";
import { NextFunction, Request, Response } from "express";
import CreateBoardDto from "./dtos/createBoardDto";
import { StatusCodes } from "http-status-codes";
import AddMemsToBoardDto from "./dtos/addMemsToBoard";
export default class BoardController {
  private boardService = new BoardService();
  public createBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user.id;
    const model : CreateBoardDto = req.body;
    const board = await this.boardService.createBoard(model, ownerId);
    res.status(StatusCodes.CREATED).json({ data: board, message: "Create board successfully" });
  })
  public addMemberToBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const boardId = req.params.id;
    const memberId : AddMemsToBoardDto = req.body;
    const board = await this.boardService.addMemberToBoard(userId, boardId, memberId);
    res.status(StatusCodes.OK).json({ data: board, message: "Add member to board successfully" });
  })
  public getAllBoardByWorkspaceId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const workspaceId = req.params.id;
    const userId = req.user.id;
    const boards = await this.boardService.getAllBoardByWorkspaceId(workspaceId, req, userId);
    res.status(StatusCodes.OK).json({ length: boards.length, data: boards, message: "Get all board successfully" });
  })
  public getBoardDetail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id
    const boardId = req.params.id
    const board = await this.boardService.getBoardDetail(boardId, userId)
    res.status(StatusCodes.OK).json({ data: board, message: 'Get board detail successfully' })
  })
  public getAllUserBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id
    const boards = await this.boardService.getAllUserBoard(userId)
    res.status(200).json({ data: boards, message: 'Get all user board successfully' })
  })
  public getMemberByBoardId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const boardId = req.params.id
    const userId = req.user.id
    const members = await this.boardService.getMemberByBoardId(boardId, userId)
    res.status(StatusCodes.OK).json({ data: members, message: 'Get all member by board id successfully' })
  })
  public updateBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id
    const boardId = req.params.id
    const model = req.body
    const board = await this.boardService.updateBoard(model, boardId, userId)
    res.status(StatusCodes.OK).json({ data: board, message: 'Update board successfully' })
  })
}