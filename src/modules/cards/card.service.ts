import { OBJECT_ID, isBoardMember, isEmptyObject } from '@core/utils';
import CardSchema from './card.model';
import CreateCardDto from './dtos/createCardDto';
import { HttpException } from '@core/exceptions';
import { BoardSchema } from '@modules/boards';
import { ColumnSchema } from '@modules/columns';
import ICard from './card.interface';
import { generateCardId } from '@core/utils/helpers';
export default class CardService {
  private cardSchema = CardSchema;
  public async createCard(model: CreateCardDto, userId: string): Promise<void> {
    if(isEmptyObject(model)){
      throw new HttpException(400, "Model is empty");
    }
    const existColumn = await ColumnSchema.findById(model.columnId).exec();
    if(!existColumn) {
      throw new HttpException(409, 'Column not found');
    }
    const existBoard = await BoardSchema.findById(existColumn.boardId).exec();
    if(!existBoard) {
      throw new HttpException(409, 'Board not found');
    }
    const checkBoardMember = await isBoardMember(existColumn.boardId, userId);
    if(!checkBoardMember) {
      throw new HttpException(403, 'You are not member of this board');
    }
    const lengthCardInBoard = await this.cardSchema.find({boardId: existColumn.boardId}).count();
    const newCard = await this.cardSchema.create({
      ...model,
      cardId: generateCardId(existBoard.title, lengthCardInBoard),
      boardId: existColumn.boardId,
      reporterId: userId,
    });
    await ColumnSchema.findByIdAndUpdate(
      {_id: new OBJECT_ID(newCard.columnId)}, 
      {$push: {cardOrderIds: newCard._id}},
      {new: true}).exec();  
  }
  public async getCardById(cardId: string): Promise<ICard> {
    const card = await this.cardSchema.findById(cardId).exec();
    if(!card) {
      throw new HttpException(409, 'Card not found');
    }
    return card;
  }
}