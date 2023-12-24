import { catchAsync, getImageUrl } from "@core/utils";
import CardService from "./card.service";
import { NextFunction, Request, Response } from "express";
import UpdateCardDto from "./dtos/updateCardDto";
import { StatusCodes } from "http-status-codes";
import assignUserDto from "./dtos/assignUserDto";
export default class CardController {
  private cardService = new CardService();
  public createCard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const model = req.body;
    const newCard = await this.cardService.createCard(model, userId);
    res
      .status(StatusCodes.CREATED)
      .json({ data: newCard, message: "Create card successfully" });
  });
  public getDetailCardById = catchAsync(async (req: Request, res: Response) => {
    const cardId = req.params.id;
    const userId = req.user.id;
    const card = await this.cardService.getDetailCardById(cardId, userId);
    res
      .status(StatusCodes.OK)
      .json({ data: card, message: "Get card successfully" });
  });
  public updateCard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const cardId = req.params.id;
    const model: UpdateCardDto = req.body;
    const card = await this.cardService.updateCard(cardId, model, userId);
    res
      .status(StatusCodes.OK)
      .json({ data: card, message: "Update card successfully" });
  });
  public assignMemberToCard = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const cardId = req.params.id;
      const assigneeId = req.params.assigneeId;
      await this.cardService.assignMemberToCard(userId, cardId, assigneeId);
      res
        .status(StatusCodes.OK)
        .json({ message: "Assign member to card successfully" });
    }
  );
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
  public unAssignMemberFromCard = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const cardId = req.params.id;
      const assigneeId = req.params.assigneeId;
      await this.cardService.unAssignMemberFromCard(userId, cardId, assigneeId);
      res
        .status(StatusCodes.OK)
        .json({ message: "Unassign member to card successfully" });
    }
  );
  public deleteCard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const cardId = req.params.id;
    await this.cardService.deleteCard(cardId, userId);
    res.status(StatusCodes.OK).json({ message: "Delete card successfully" });
  })
}
