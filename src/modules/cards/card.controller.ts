import { catchAsync } from "@core/utils";
import CardService from "./card.service";
import { NextFunction, Request, Response } from "express";
import UpdateCardDto from "./dtos/updateCardDto";
import { StatusCodes } from "http-status-codes";
import assignUserDto from "./dtos/assignUserDto";
export default class CardController {
  private cardService = new CardService();  
  public createCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const model = req.body;
    await this.cardService.createCard(model, userId);
    res.status(StatusCodes.CREATED).json({ message: "Create card successfully" });
  })
  public getCardById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const cardId = req.params.id;
    const card = await this.cardService.getCardById(cardId);
    res.status(StatusCodes.OK).json({ data: card, message: "Get card successfully" });
  })
  public updateCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const cardId = req.params.id;
    const model : UpdateCardDto = req.body;
    const card = await this.cardService.updateCard(cardId, model, userId);
    res.status(StatusCodes.OK).json({ data: card, message: "Update card successfully" }); 
  })
  public assignMemberToCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const cardId = req.params.id;
    const model : assignUserDto = req.body;
    await this.cardService.assignMemberToCard(userId, cardId, model);
    res.status(StatusCodes.OK).json({ message: "Assign member to card successfully" });
  })
}