import { startSession } from "mongoose";
import EpicService from "./epic.service";
import { NextFunction, Request, Response } from "express";
import CreateEpicDto from "./dtos/createEpicDto";
import { StatusCodes } from "http-status-codes";
import UpdateEpicDto from "./dtos/updateEpicDto";
import AddCommentDto from "./dtos/addCommentDto";
import UpdateCommentDto from "./dtos/updateCommentDto";
import { catchAsync } from "@core/utils";
export default class EpicController {
  private epicService = new EpicService();
  public createEpic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const model: CreateEpicDto = req.body;
      const boardId = req.params.boardId;
      const userId = req.user.id;
      session.startTransaction();
      const newEpic = await this.epicService.createEpic(
        model,
        boardId,
        userId,
        session
      );
      res
        .status(StatusCodes.CREATED)
        .json({ data: newEpic, message: "Create epic successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  public updateEpic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const model: UpdateEpicDto = req.body;
      const boardId = req.params.boardId;
      const epicId = req.params.id;
      const userId = req.user.id;
      session.startTransaction();
      const updatedEpic = await this.epicService.updateEpic(
        model,
        boardId,
        userId,
        session,
        epicId
      );
      res.status(StatusCodes.OK).json({ message: "Update epic successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  public getDetailEpicById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const epicId = req.params.id;
      const boardId = req.params.boardId;
      const epic = await this.epicService.getEpicDetailByBoardId(
        epicId,
        boardId
      );
      console.log("🚀 ~ EpicController ~ epic:", epic);
      res
        .status(StatusCodes.OK)
        .json({ data: epic, message: "Get epic detail successfully" });
    } catch (error) {
      next(error);
    }
  };
  public getEpicsByBoardId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const boardId = req.params.boardId;
      const epics = await this.epicService.getEpicsByBoardId(boardId);
      res
        .status(StatusCodes.OK)
        .json({ data: epics, message: "Get epics successfully" });
    } catch (error) {
      next(error);
    }
  };
  public addCommentToEpic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const epicId = req.params.id;
      const model: AddCommentDto = req.body;
      session.startTransaction();
      await this.epicService.addCommentToEpic(userId, model, epicId, session);
      res
        .status(StatusCodes.OK)
        .json({ message: "Add comment to epic successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  public updateCommentInEpic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const epicId = req.params.id;
      const commentId = req.params.commentId;
      const model: UpdateCommentDto = req.body;
      session.startTransaction();
      await this.epicService.updateCommentInEpic(
        epicId,
        userId,
        model,
        commentId,
        session
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Update comment in epic successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  public deleteCommentInEpic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const epicId = req.params.id;
      const commentId = req.params.commentId;
      await this.epicService.deleteCommentInEpic(epicId, userId, commentId);
      res
        .status(StatusCodes.OK)
        .json({ message: "Delete comment in epic successfully" });
    } catch (err) {
      next(err);
    }
  };
  public getCommentsInEpic = catchAsync(async (req: Request, res: Response) => {
    const epicId = req.params.id;
    const comments = await this.epicService.getCommentsInEpic(epicId);
    res.status(StatusCodes.OK).json({
      data: comments,
      message: "Get comments in epic successfully",
    });
  });
}
