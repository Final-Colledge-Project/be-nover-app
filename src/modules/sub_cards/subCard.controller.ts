import { catchAsync } from "@core/utils";
import { Request, Response } from "express";
import SubCardService from "./subCard.service";
import AddSubTaskDto from "./dtos/addSubTaskDto";
import { StatusCodes } from "http-status-codes";
export default class SubCardController {
  private subCardService = new SubCardService();
  public createSubCard = catchAsync(async (req: Request, res: Response) => {
    const model: AddSubTaskDto = req.body;
    const userId = req.user.id;
    const subCard = await this.subCardService.createSubCard(model, userId);
    res
      .status(StatusCodes.CREATED)
      .json({ data: subCard, message: "Create sub card successfully" });
  });
  public assignMemberToSubCard = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const subCardId = req.params.id;
      const assigneeId = req.params.assigneeId;
      await this.subCardService.assignMemberToSubCard(
        userId,
        subCardId,
        assigneeId
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
      res
        .status(StatusCodes.OK)
        .json({
          data: subCards,
          message: "Get all sub card in card successfully",
        });
    }
  );
  public updateSubCard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const subCardId = req.params.id;
    const model: AddSubTaskDto = req.body;
    const updatedSubCard = await this.subCardService.updateSubCard(
      model,
      subCardId,
      userId
    );
    res
      .status(StatusCodes.OK)
      .json({ data: updatedSubCard, message: "Update sub card successfully" });
  });
}
