import { StatusCodes } from "http-status-codes";
import CreatePriorityDto from "./dtos/createPriorityDto";
import PriorityService from "./priority.service";
import { Request, Response, NextFunction } from "express";
import UpdatePriorityDto from "./dtos/updatePriorityDto";
import { startSession } from "mongoose";
import { MAX_RESULT } from "@core/utils";
export default class PriorityController {
  private priorityService = new PriorityService();
  public createPriority = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const model: CreatePriorityDto = req.body;
      const boardId = req.params.boardId;
      const newPriority = await this.priorityService.createPriority(
        model,
        boardId
      );
      res.status(StatusCodes.CREATED).json({
        data: newPriority,
        message: "Create priority successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public updatePriority = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const model: UpdatePriorityDto = req.body;
      const priorityId = req.params.priorityId;
      await this.priorityService.updatePriority(model, priorityId);
      res.status(StatusCodes.OK).json({
        message: "Update priority successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public deletePriority = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const priorityId = req.params.priorityId;
      session.startTransaction();
      await this.priorityService.deletePriority(priorityId, session);
      res.status(StatusCodes.OK).json({
        message: "Delete priority successfully",
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
  public getPriorityByBoardId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const boardId = req.params.boardId;
      const userId = req.user.id;
      const priorities = await this.priorityService.getPriorityByBoardId(
        req,
        boardId,
        userId
      );
      res.status(StatusCodes.OK).json({
        data: priorities,
        maxResults: MAX_RESULT,
        message: "Get priorities successfully",
      });
    } catch (err) {
      next(err);
    }
  };
}
