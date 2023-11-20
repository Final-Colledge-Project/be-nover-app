import {
  OBJECT_ID,
  isBoardMember,
  isCardNumber,
  isEmptyObject,
} from "@core/utils";
import CardSchema from "./card.model";
import CreateCardDto from "./dtos/createCardDto";
import { HttpException } from "@core/exceptions";
import { BoardSchema } from "@modules/boards";
import { ColumnSchema } from "@modules/columns";
import ICard from "./card.interface";
import { generateCardId } from "@core/utils/helpers";
import UpdateCardDto from "./dtos/updateCardDto";
import { StatusCodes } from "http-status-codes";
import assignUserDto from "./dtos/assignUserDto";
import { UserSchema } from "@modules/users";
export default class CardService {
  private cardSchema = CardSchema;
  public async createCard(model: CreateCardDto, userId: string): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const existColumn = await ColumnSchema.findById(model.columnId).exec();
    if (!existColumn) {
      throw new HttpException(409, "Column not found");
    }
    const existBoard = await BoardSchema.findById(existColumn.boardId).exec();
    if (!existBoard) {
      throw new HttpException(409, "Board not found");
    }
    const checkBoardMember = await isBoardMember(existColumn.boardId, userId);
    if (!checkBoardMember) {
      throw new HttpException(403, "You are not member of this board");
    }
    const lengthCardInBoard = await this.cardSchema
      .find({ boardId: existColumn.boardId })
      .count();
    const newCard = await this.cardSchema.create({
      ...model,
      cardId: generateCardId(existBoard.title, lengthCardInBoard),
      boardId: existColumn.boardId,
      reporterId: userId,
    });
    await ColumnSchema.findByIdAndUpdate(
      { _id: new OBJECT_ID(newCard.columnId) },
      { $push: { cardOrderIds: newCard._id } },
      { new: true }
    ).exec();
  }
  public async getCardById(cardId: string): Promise<ICard> {
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(409, "Card not found");
    }
    return card;
  }
  public async updateCard(
    cardId: string,
    model: UpdateCardDto,
    userId: string
  ): Promise<ICard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    const checkBoardMember = await isBoardMember(card.boardId, userId);
    if (!checkBoardMember) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not member of this board"
      );
    }
    const updateCard = await this.cardSchema
      .findByIdAndUpdate(
        { _id: cardId },
        { ...model, updatedAt: Date.now() },
        { new: true }
      )
      .exec();
    if (!updateCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Update card failed");
    }
    return updateCard;
  }
  public async assignMemberToCard(
    userId: string,
    cardId: string,
    model: assignUserDto
  ): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const member = await UserSchema.findOne({ email: model.email }).exec();
    if (!member) {
      throw new HttpException(StatusCodes.CONFLICT, "User not found");
    }
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    const checkBoardMember = await isBoardMember(card.boardId, userId);
    if (!checkBoardMember) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not member of this board"
      );
    }
    const checkCardMember = await isCardNumber(cardId, member.id);
    if (checkCardMember) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "User is already member of this card"
      );
    }
    await this.cardSchema.findByIdAndUpdate(
      {
        _id: cardId,
      },
      {
        $push: { memberIds: member.id },
      },
      { new: true }
    );
  }
}
