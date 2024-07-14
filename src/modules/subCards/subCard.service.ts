import {
  OBJECT_ID,
  generateSubCardId,
  isBoardMember,
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
import { BoardSchema } from "@modules/boards";
import { ClientSession } from "mongoose";
import { TaskLogSchema } from "@modules/taskLogs";
import { LabelSchema } from "@modules/labels";
import { PrioritySchema } from "@modules/priorities";
import { IssueTypeSchema } from "@modules/issueTypes";
export default class SubCardService {
  private subCardSchema = SubCardSchema;
  private cardSchema = CardSchema;
  private boardSchema = BoardSchema;
  private labelSchema = LabelSchema;
  private prioritySchema = PrioritySchema;
  private issueTypeSchema = IssueTypeSchema;
  public async createSubCard(
    model: AddSubTaskDto,
    session: ClientSession,
    boardId: string
  ): Promise<ISubCard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existCard = await this.cardSchema
      .findOne({ _id: model.cardId, boardId: boardId })
      .exec();
    if (!existCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    const existBoard = await this.boardSchema
      .findById(existCard.boardId)
      .exec();
    if (!existBoard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    if (model.labelId) {
      const label = await this.labelSchema
        .findOne({ _id: model.labelId, boardId: existCard.boardId })
        .exec();
      if (!label) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Label not found");
      }
    }
    if (model.priorityId) {
      const priority = await this.prioritySchema
        .findOne({ _id: model.priorityId, boardId: existCard.boardId })
        .exec();
      if (!priority) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Priority not found");
      }
    }
    const issueType = await this.issueTypeSchema
      .findOne({ _id: model.issueTypeId, boardId: existCard.boardId })
      .exec();
    if (!issueType) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "IssueType not found");
    }
    if (issueType.hierarchy !== 3) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "IssueType is not suitable for issue"
      );
    }
    const newSubCard = await this.subCardSchema.create(
      [
        {
          ...model,
          subCardId: existBoard.nextAutoIncrement.toString(),
          cardId: existCard._id,
        },
      ],
      { session }
    );
    await this.cardSchema
      .findByIdAndUpdate(
        { _id: model.cardId },
        {
          $push: { subCardIds: newSubCard[0]._id },
        },
        { new: true, session }
      )
      .exec();
    existBoard.nextAutoIncrement += 1;
    await existBoard.save({ session });
    return newSubCard[0];
  }
  public async assignMemberToSubCard(
    subCardId: string,
    assigneeId: string,
    boardId: string
  ): Promise<void> {
    const existedSubCard = await this.subCardSchema.findById(subCardId).exec();
    if (!existedSubCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Subcard not found");
    }
    const existedCard = await this.cardSchema
      .findById(existedSubCard.cardId)
      .exec();
    if (!existedCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    const checkBoarMemberByAssignee = await isBoardMember(boardId, assigneeId);
    if (!checkBoarMemberByAssignee) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Assignee is not member of this board"
      );
    }
    await this.subCardSchema
      .findByIdAndUpdate(subCardId, { assignedTo: assigneeId }, { new: true })
      .exec();
  }
  public async getAllSubCardInCard(
    cardId: string,
    userId: string
  ): Promise<object> {
    const existCard = await this.cardSchema.findById(cardId).exec();
    if (!existCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
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
    boardId: string
  ): Promise<ISubCard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existSubCard = await this.subCardSchema
      .findOne({
        _id: subCardId,
        boardId: boardId,
      })
      .exec();
    if (!existSubCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Subcard not found");
    }
    const existCard = await this.cardSchema
      .findById(existSubCard.cardId)
      .exec();
    if (!existCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    if (model.labelId) {
      const label = await this.labelSchema
        .findOne({ _id: model.labelId, boardId: existCard.boardId })
        .exec();
      if (!label) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Label not found");
      }
    }
    if (model.priorityId) {
      const priority = await this.prioritySchema
        .findOne({ _id: model.priorityId, boardId: existCard.boardId })
        .exec();
      if (!priority) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Priority not found");
      }
    }
    const issueType = await this.issueTypeSchema
      .findOne({ _id: model.issueTypeId, boardId: existCard.boardId })
      .exec();
    if (!issueType) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "IssueType not found");
    }
    if (issueType.hierarchy !== 3) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "IssueType is not suitable for issue"
      );
    }
    const updatedSubCard = await this.subCardSchema
      .findByIdAndUpdate(subCardId, { ...model }, { new: true })
      .exec();
    if (!updatedSubCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Subcard not found");
    }
    return updatedSubCard;
  }
  public async deleteSubCard(subCardId: string): Promise<void> {
    const existSubCard = await this.subCardSchema.findById(subCardId).exec();
    if (!existSubCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Subcard not found");
    }
    const existCard = await this.cardSchema
      .findById(existSubCard.cardId)
      .exec();
    if (!existCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    await this.subCardSchema
      .findByIdAndUpdate(
        subCardId,
        {
          isDeleted: true,
        },
        { new: true }
      )
      .exec();
    await this.cardSchema
      .findByIdAndUpdate(
        { _id: new OBJECT_ID(existSubCard.cardId) },
        {
          $pull: { subCards: existSubCard._id },
        },
        { new: true }
      )
      .exec();
  }
  public async unAssignMemberFromSubCard(subCardId: string): Promise<void> {
    const card = await this.subCardSchema.findById(subCardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "SubCard not found");
    }
    await this.subCardSchema.findByIdAndUpdate(
      {
        _id: subCardId,
      },
      {
        $set: { assignedTo: null },
      },
      { new: true }
    );
  }
}
