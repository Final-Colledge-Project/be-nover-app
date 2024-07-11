import { startSession } from "mongoose";
import EpicService from "./epic.service";
import { NextFunction, Request, Response } from "express";
import CreateEpicDto from "./dtos/createEpicDto";
import { StatusCodes } from "http-status-codes";
import UpdateEpicDto from "./dtos/updateEpicDto";
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
}
