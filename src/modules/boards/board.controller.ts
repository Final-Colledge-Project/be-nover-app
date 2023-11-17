import { catchAsync } from '@core/utils'
import {NextFunction, Request, Response} from 'express';

import BoardService from './board.service';
import CreateBoardDto from './dtos/createBoardDto'

export default class BoardController {
  private boardService = new BoardService()
  public createBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user.id
    const model: CreateBoardDto = req.body
    const board = await this.boardService.createBoard(model, ownerId)
    res.status(201).json({ data: board, message: 'Create board successfully' })
  })
  public addMemberToBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id
    const boardId = req.params.id
    const memberId = req.params.memberId
    const board = await this.boardService.addMemberToBoard(userId, boardId, memberId)
    res.status(200).json({ data: board, message: 'Add member to board successfully' })
  })
  public getAllBoardByWorkspaceId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const workspaceId = req.params.id
    const userId = req.user.id
    const boards = await this.boardService.getAllBoardByWorkspaceId(workspaceId, req, userId)
    res.status(200).json({ length: boards.length, data: boards, message: 'Get all board successfully' })
  })
  public getBoardDetail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id
    const boardId = req.params.id
    const board = await this.boardService.getBoardDetail(boardId, userId)
    res.status(200).json({ data: board, message: 'Get board detail successfully' })
  })
}
