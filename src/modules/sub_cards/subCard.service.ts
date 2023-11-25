import { OBJECT_ID, generateCardId, generateSubCardId, isBoardMember, isEmptyObject } from "@core/utils";
import AddSubTaskDto from "./dtos/addSubTaskDto";
import SubCardSchema from "./subCard.model";
import { HttpException } from "@core/exceptions";
import { CardSchema } from "@modules/cards";
import ISubCard from "./subCard.interface";
export default class SubCardService {
  private subCardSchema = SubCardSchema;
  private cardSchema = CardSchema;
  public async createSubCard(model: AddSubTaskDto, userId: string): Promise<ISubCard> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const existCard = await this.cardSchema.findById(model.cardId).exec();
    if (!existCard) {
      throw new HttpException(409, "Card not found");
    }
    const checkBoardMember = await isBoardMember(existCard.boardId, userId);
    if (!checkBoardMember) {
      throw new HttpException(403, "You are not member of this board");
    }
    const lengthSubCardInCard = await this.subCardSchema
      .find({ cardId: existCard._id })
      .count();
    const newSubCard = await this.subCardSchema.create({
      ...model,
      subCardId: generateSubCardId(existCard.cardId, lengthSubCardInCard),
      cardId: existCard._id
    });
    await this.cardSchema.findByIdAndUpdate(
      { _id: new OBJECT_ID(newSubCard.cardId) },
      { $push: { subCards: newSubCard._id }, $set: { updatedAt: Date.now() } },
      { new: true }
    ).exec();

    return newSubCard;
  }
}