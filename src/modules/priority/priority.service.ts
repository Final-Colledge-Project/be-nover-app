import { isBoardMember, isEmptyObject } from "@core/utils";
import { PrioritySchema } from ".";
import CreatePriorityDto from "./dtos/createPriorityDto";
import IPriority from "./priority.interface";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import { BoardSchema } from "@modules/boards";
import UpdatePriorityDto from "./dtos/updatePriorityDto";
import { EpicSchema } from "@modules/epic";
import { CardSchema } from "@modules/cards";
import { SubCardSchema } from "@modules/subCards";
import { Request } from "express";
import APIFeatures from "@core/utils/apiFeature";
import { ClientSession } from "mongoose";
export default class PriorityService {
  private prioritySchema = PrioritySchema;
  private boardSchema = BoardSchema;
  private epicSchema = EpicSchema;
  private cardSchema = CardSchema;
  private subCardSchema = SubCardSchema;
  public async createPriority(
    model: CreatePriorityDto,
    boardId: string
  ): Promise<IPriority> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existedBoard = await this.boardSchema.findById(boardId);
    if (!existedBoard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    const newPriority = new this.prioritySchema({
      ...model,
      boardId,
    });
    await newPriority.save();
    return newPriority;
  }
  public async updatePriority(
    model: UpdatePriorityDto,
    priorityId: string
  ): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existPriority = await this.prioritySchema.findById(priorityId).exec();
    if (!existPriority) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Priority not found");
    }
    await this.prioritySchema.findByIdAndUpdate(priorityId, model);
  }
  public async deletePriority(
    priorityId: string,
    session: ClientSession
  ): Promise<void> {
    const existPriority = await this.prioritySchema.findById(priorityId).exec();
    if (!existPriority) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Priority not found");
    }
    const filter = { priorityId };
    const updateDoc = { $set: { priorityId: "" } };
    await this.epicSchema.updateMany(filter, updateDoc, { session });
    await this.cardSchema.updateMany(filter, updateDoc, { session });
    await this.subCardSchema.updateMany(filter, updateDoc, { session });
    await this.prioritySchema.findByIdAndDelete(priorityId, { session });
    await session.commitTransaction();
    session.endSession();
  }
  public async getPriorityByBoardId(
    req: Request,
    boardId: string,
    userId: string
  ): Promise<IPriority[]> {
    const isMem = await isBoardMember(boardId, userId);
    if (!isMem) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    let extendCondition = {};
    if (req.query.search) {
      extendCondition = {
        name: { $regex: req.query.search, $options: "i" },
      };
    }
    const feature = new APIFeatures(
      this.prioritySchema.find({
        boardId,
        ...extendCondition,
      }),
      req.query
    )
      .paginate()
      .sort()
      .limit()
      .filter();
    const priorities = await feature.query;
    return priorities;
  }
}
