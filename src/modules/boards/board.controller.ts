import { catchAsync, getImageUrl } from "@core/utils";
import BoardService from "./board.service";
import { Request, Response } from "express";
import CreateBoardDto from "./dtos/createBoardDto";
import { StatusCodes } from "http-status-codes";
import AddMemsToBoardDto from "./dtos/addMemsToBoard";
export default class BoardController {
  private boardService = new BoardService();
  public createBoard = catchAsync(async (req: Request, res: Response) => {
    const ownerId = req.user.id;
    const model: CreateBoardDto = req.body;
    const board = await this.boardService.createBoard(model, ownerId);
    res
      .status(StatusCodes.CREATED)
      .json({ data: board, message: "Create board successfully" });
  });
  public addMemberToBoard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const boardId = req.params.id;
    const memberId: AddMemsToBoardDto = req.body;
    const board = await this.boardService.addMemberToBoard(
      userId,
      boardId,
      memberId
    );
    const io = req.app.get("socketio");
    console.log("🚀 ~ file: board.controller.ts:28 ~ BoardController ~ addMemberToBoard=catchAsync ~ users:", io.clients)
    io.emit("add_boardMems", memberId);
    res
      .status(StatusCodes.OK)
      .json({ data: board, message: "Add member to board successfully" });
  });
  public getAllBoardByWorkspaceId = catchAsync(
    async (req: Request, res: Response) => {
      const workspaceId = req.params.id;
      const userId = req.user.id;
      const boards = await this.boardService.getAllBoardByWorkspaceId(
        workspaceId,
        req,
        userId
      );
      res.status(StatusCodes.OK).json({
        length: boards.length,
        data: boards,
        message: "Get all board successfully",
      });
    }
  );
  public getBoardDetail = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const boardId = req.params.id;
    const board = await this.boardService.getBoardDetail(boardId, userId);
    res
      .status(StatusCodes.OK)
      .json({ data: board, message: "Get board detail successfully" });
  });
  public getAllUserBoard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const boards = await this.boardService.getAllUserBoard(userId);
    res
      .status(200)
      .json({ data: boards, message: "Get all user board successfully" });
  });
  public getMemberByBoardId = catchAsync(
    async (req: Request, res: Response) => {
      const boardId = req.params.id;
      const userId = req.user.id;
      const members = await this.boardService.getMemberByBoardId(
        boardId,
        userId
      );
      res.status(StatusCodes.OK).json({
        data: members,
        message: "Get all member by board id successfully",
      });
    }
  );
  public updateBoard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const boardId = req.params.id;
    const model = req.body;
    const board = await this.boardService.updateBoard(model, boardId, userId);
    res
      .status(StatusCodes.OK)
      .json({ data: board, message: "Update board successfully" });
  });
  public grandBoardAdmin = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const boardId = req.params.id;
    const memberId = req.params.memberId;
    await this.boardService.grandBoardAdmin(userId, boardId, memberId);
    res
      .status(StatusCodes.OK)
      .json({ message: "Grand board admin successfully" });
  });
  public revokeBoardAdmin = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const boardId = req.params.id;
    const boardAdminId = req.params.memberId;
    await this.boardService.revokeBoardAdmin(userId, boardId, boardAdminId);
    res
      .status(StatusCodes.OK)
      .json({ message: "Revoke board admin successfully" });
  });
  public uploadCoverBoard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const boardId = req.params.id;
    const imageUrl = await getImageUrl(req);
    const boardCover = await this.boardService.uploadCoverBoard(
      userId,
      boardId,
      imageUrl
    );
    res
      .status(200)
      .json({ data: boardCover, message: "Upload board cover successfully" });
  });
  public deleteMemberFromBoard = catchAsync(async(req: Request, res: Response) => {
    const userId = req.user.id;
    const boardId = req.params.id;
    const memberId = req.params.memberId;
    await this.boardService.deleteMemberFromBoard(userId, boardId, memberId);
    res.status(StatusCodes.OK).json({ message: "Delete member from board successfully" });
  })
  public deleteBoard = catchAsync(async (req: Request, res: Response) => { 
    const userId = req.user.id;
    const boardId = req.params.id;
    await this.boardService.deleteBoard(boardId, userId);
    res.status(StatusCodes.OK).json({ message: "Delete board successfully" });
  })
}
