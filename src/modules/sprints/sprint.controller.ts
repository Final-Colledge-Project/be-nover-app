import { startSession } from "mongoose";
import SprintService from "./sprint.service";
import { NextFunction, Request, Response } from "express";
import CreateSprintDto from "./dtos/createSprintDto";
import { StatusCodes } from "http-status-codes";
export default class SprintController {
  private sprintService = new SprintService();
  public createSprint = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      session.startTransaction();
      const model: CreateSprintDto = req.body;
      const boardId = req.params.boardId;
      const userId = req.user.id;
      const sprint = await this.sprintService.createSprint(
        model,
        boardId,
        userId,
        session
      );
      res.status(StatusCodes.CREATED).json({
        data: sprint,
        message: "Create sprint successfully",
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
  public updateSprint = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      session.startTransaction();
      const model: CreateSprintDto = req.body;
      const sprintId = req.params.id;
      const userId = req.user.id;
      const sprint = await this.sprintService.updateSprint(
        model,
        sprintId,
        userId,
        session
      );
      res.status(StatusCodes.OK).json({
        data: sprint,
        message: "Update sprint successfully",
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
  public getSprintById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sprintId = req.params.id;
      const boardId = req.params.boardId;
      const userId = req.user.id;
      const sprint = await this.sprintService.getSprintById(
        sprintId,
        boardId,
        userId
      );
      res.status(StatusCodes.OK).json({
        data: sprint,
        message: "Get sprint successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public getAllSprintsByBoard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const boardId = req.params.boardId;
      const userId = req.user.id;
      const sprints = await this.sprintService.getSprintsByBoardId(
        boardId,
        userId
      );
      res.status(StatusCodes.OK).json({
        data: sprints,
        message: "Get all sprints successfully",
      });
    } catch (err) {
      next(err);
    }
  };
}
