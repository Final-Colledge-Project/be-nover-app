import { startSession } from "mongoose";
import ColumnStatusService from "./colStatus.service";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import CreateColumnStatusDto from "./dtos/createColStatusDto";

export default class ColumnStatusController {
  private colStatusService = new ColumnStatusService();
  public createColumnService = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const model: CreateColumnStatusDto = req.body;
      const boardId = req.params.boardId;
      session.startTransaction();
      await this.colStatusService.createColumnStatus(model, boardId, session);
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Create board successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
}
