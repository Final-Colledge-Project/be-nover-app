import {
  OBJECT_ID,
  generateSubCardId,
  isEmptyObject,
  permissionCard,
  viewedBoardPermission,
} from "@core/utils";
import AddSubTaskDto from "./dtos/addSubTaskDto";
import SubCardSchema from "./subCard.model";
import { HttpException } from "@core/exceptions";
import { CardSchema } from "@modules/cards";
import ISubCard from "./subCard.interface";
import { StatusCodes } from "http-status-codes";
import UpdateSubTaskDto from "./dtos/updateSubTaskDto";
export default class SubCardService {
  private subCardSchema = SubCardSchema;
  private cardSchema = CardSchema;
  public async createSubCard(
    model: AddSubTaskDto,
    userId: string
  ): Promise<ISubCard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existCard = await this.cardSchema.findById(model.cardId).exec();
    if (!existCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    const checkPermissionCard = await permissionCard(existCard.boardId, userId);
    if (!checkPermissionCard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to create subcard"
      );
    }
    const lengthSubCardInCard = await this.subCardSchema
      .find({ cardId: existCard._id })
      .count();
    const newSubCard = await this.subCardSchema.create({
      ...model,
      subCardId: generateSubCardId(existCard.cardId, lengthSubCardInCard),
      cardId: existCard._id,
    });
    await this.cardSchema
      .findByIdAndUpdate(
        { _id: new OBJECT_ID(newSubCard.cardId) },
        {
          $push: { subCards: newSubCard._id },
          $set: { updatedAt: Date.now() },
        },
        { new: true }
      )
      .exec();

    return newSubCard;
  }
  public async assignMemberToSubCard(
    userId: string,
    subCardId: string,
    assigneeId: string
  ): Promise<void> {
    const existedSubCard = await this.subCardSchema.findById(subCardId).exec();
    if (!existedSubCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Subcard not found");
    }
    const existedCard = await this.cardSchema
      .findById(existedSubCard.cardId)
      .exec();
    if (!existedCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    const checkPermissionCard = await permissionCard(existedCard.boardId, userId);
    if (!checkPermissionCard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to assign member to subcard"
      );
    }
    const isMemberInCard = existedCard.memberIds.includes(assigneeId);
    if (!isMemberInCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Member not found in card");
    }
    await this.subCardSchema
      .findByIdAndUpdate(
        subCardId,
        { assignedTo: assigneeId, updatedAt: Date.now() },
        { new: true }
      )
      .exec();
  }
  public async getAllSubCardInCard(
    cardId: string,
    userId: string
  ): Promise<object> {
    const existCard = await this.cardSchema.findById(cardId).exec();
    if (!existCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    const isViewedBoard = await viewedBoardPermission(
      existCard.boardId,
      userId
    );
    if (isViewedBoard === false) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not member of this board"
      );
    }
    const subCards = await this.subCardSchema
      .find({ cardId: existCard._id })
      .populate({
        path: "assignedTo",
        select: "_id firstName lastName email avatar",
      })
      .select("-__v")
      .exec();
    return subCards;
  }
  public async updateSubCard(
    model: UpdateSubTaskDto,
    subCardId: string,
    userId: string
  ): Promise<ISubCard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existSubCard = await this.subCardSchema.findById(subCardId).exec();
    if (!existSubCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Subcard not found");
    }
    const existCard = await this.cardSchema
      .findById(existSubCard.cardId)
      .exec();
    if (!existCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    const checkPermissionCard = await permissionCard(existCard.boardId, userId);
    if (!checkPermissionCard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to update subcard"
      );
    }
    const updatedSubCard = await this.subCardSchema
      .findByIdAndUpdate(
        subCardId,
        { ...model, updatedAt: Date.now() },
        { new: true }
      )
      .exec();
    if (!updatedSubCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Subcard not found");
    }
    return updatedSubCard;
  }
  public async deleteSubCard(subCardId: string, userId: string): Promise<void> {
    const existSubCard = await this.subCardSchema.findById(subCardId).exec();
    if (!existSubCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Subcard not found");
    }
    const existCard = await this.cardSchema
      .findById(existSubCard.cardId)
      .exec();
    if (!existCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    const checkPermissionCard = await permissionCard(existCard.boardId, userId);
    if (!checkPermissionCard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to delete subcard"
      );
    }
    await this.subCardSchema.findByIdAndUpdate(subCardId, {
      assignedTo: null,
      isActive: false,
      updatedAt: Date.now(),
    });
  }
}
