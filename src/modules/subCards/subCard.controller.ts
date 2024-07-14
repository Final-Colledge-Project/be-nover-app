import { catchAsync } from "@core/utils";
import { NextFunction, Request, Response } from "express";
import SubCardService from "./subCard.service";
import AddSubTaskDto from "./dtos/addSubTaskDto";
import { StatusCodes } from "http-status-codes";
import { startSession } from "mongoose";
export default class SubCardController {
  private subCardService = new SubCardService();
  public createSubCard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const model: AddSubTaskDto = req.body;
      const boardId: string = req.params.boardId;
      const subCard = await this.subCardService.createSubCard(
        model,
        session,
        boardId
      );
      res
        .status(StatusCodes.CREATED)
        .json({ data: subCard, message: "Create sub card successfully" });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
  public assignMemberToSubCard = catchAsync(
    async (req: Request, res: Response) => {
      const subCardId = req.params.id;
      const assigneeId = req.body.memId;
      const boardId = req.params.boardId;
      await this.subCardService.assignMemberToSubCard(
        subCardId,
        assigneeId,
        boardId
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Assign member to sub card successfully" });
    }
  );
  public getAllSubCardInCard = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const cardId = req.params.id;
      const subCards = await this.subCardService.getAllSubCardInCard(
        cardId,
        userId
      );
      res.status(StatusCodes.OK).json({
        data: subCards,
        message: "Get all sub card in card successfully",
      });
    }
  );
  public updateSubCard = catchAsync(async (req: Request, res: Response) => {
    const subCardId = req.params.id;
    const model: AddSubTaskDto = req.body;
    const boardId: string = req.params.boardId;
    const updatedSubCard = await this.subCardService.updateSubCard(
      model,
      subCardId,
      boardId
    );
    res
      .status(StatusCodes.OK)
      .json({ data: updatedSubCard, message: "Update sub card successfully" });
  });
  public unassignMemberToSubCard = catchAsync(
    async (req: Request, res: Response) => {
      const subCardId = req.params.id;
      await this.subCardService.unAssignMemberFromSubCard(subCardId);
      res
        .status(StatusCodes.OK)
        .json({ message: "Unassign member to sub card successfully" });
    }
  );
}
