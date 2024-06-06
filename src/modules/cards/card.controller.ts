import { catchAsync, getImageUrl } from "@core/utils";
import CardService from "./card.service";
import { NextFunction, Request, Response } from "express";
import UpdateCardDto from "./dtos/updateCardDto";
import { StatusCodes } from "http-status-codes";
import assignUserDto from "./dtos/assignUserDto";
import { startSession } from "mongoose";
export default class CardController {
  private cardService = new CardService();
  public createCard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const model = req.body;
      const boardId = req.params.boardId;
      session.startTransaction();
      const newCard = await this.cardService.createCard(
        model,
        userId,
        boardId,
        session
      );
      res
        .status(StatusCodes.CREATED)
        .json({ data: newCard, message: "Create card successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  public getDetailCardById = catchAsync(async (req: Request, res: Response) => {
    const cardId = req.params.id;
    const userId = req.user.id;
    const card = await this.cardService.getDetailCardById(cardId, userId);
    res
      .status(StatusCodes.OK)
      .json({ data: card, message: "Get card successfully" });
  });
  public updateCard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const cardId = req.params.id;
      const model: UpdateCardDto = req.body;
      session.startTransaction();
      const card = await this.cardService.updateCard(
        cardId,
        model,
        userId,
        session
      );
      res
        .status(StatusCodes.OK)
        .json({ data: card, message: "Update card successfully" });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
  public assignMemberToCard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const cardId = req.params.id;
      const assigneeId = req.body.memId;
      session.startTransaction();
      await this.cardService.assignMemberToCard(
        userId,
        cardId,
        assigneeId,
        session
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Assign member to card successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  public getMemsInCard = catchAsync(async (req: Request, res: Response) => {
    const cardId = req.params.id;
    const userId = req.user.id;
    const members = await this.cardService.getMemberInCard(cardId, userId);
    res
      .status(StatusCodes.OK)
      .json({ data: members, message: "Get members in card successfully" });
  });
  public uploadCoverCard = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const cardId = req.params.id;
      const imageUrl = await getImageUrl(req);
      const cardCover = await this.cardService.uploadCoverCard(
        userId,
        cardId,
        imageUrl
      );
      res
        .status(StatusCodes.OK)
        .json({ data: cardCover, message: "Upload card cover successfully" });
    }
  );
  public unAssignMemberFromCard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const cardId = req.params.id;
      const userId = req.user.id;
      session.startTransaction();
      await this.cardService.unAssignMemberFromCard(cardId, userId, session);
      res
        .status(StatusCodes.OK)
        .json({ message: "Unassign member to card successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  public deleteCard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const cardId = req.params.id;
    await this.cardService.deleteCard(cardId, userId);
    res.status(StatusCodes.OK).json({ message: "Delete card successfully" });
  });
  public assignedToMe = catchAsync(async (req: Request, res: Response) => {
    const assignedToMe = await this.cardService.cardAssignedToMe(req.user.id);
    res.status(StatusCodes.OK).json({
      data: assignedToMe,
      message: "Get task assigned to me successfully",
    });
  });
}
