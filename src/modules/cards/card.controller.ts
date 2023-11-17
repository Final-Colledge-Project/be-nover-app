import { catchAsync } from '@core/utils';
import {NextFunction, Request, Response} from 'express'

import CardService from './card.service'

export default class CardController {
  private cardService = new CardService();
  public createCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const model = req.body;
    await this.cardService.createCard(model, userId);
    res.status(201).json({ message: 'Create card successfully'});
  })
  public getCardById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const cardId = req.params.id;
    const card = await this.cardService.getCardById(cardId);
    res.status(200).json({ data: card, message: 'Get card successfully'});
  })
}
