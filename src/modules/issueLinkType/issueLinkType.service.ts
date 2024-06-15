import { BoardSchema } from "@modules/boards";
import IssueLinkTypeSchema from "./issueLinkType.model";
import IIssueLinkType from "./issueLinkType.interface";
import CreateIssueLinkTypeDto from "./dtos/createIssueLinkTypeDto";
import { isBoardMember, isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import UpdateIssueLinkTypeDto from "./dtos/updateIssueLinkTypeDto";
import { IssueLinkSchema } from "@modules/issueLink";
import APIFeatures from "@core/utils/apiFeature";
import { Request } from "express";
export default class IssueLinkTypeService {
  private boardSchema = BoardSchema;
  private issueLinkTypeSchema = IssueLinkTypeSchema;
  private issueLinkSchema = IssueLinkSchema;
  public async createLinkIssueType(
    model: CreateIssueLinkTypeDto,
    boardId: string
  ): Promise<IIssueLinkType> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existedBoard = await this.boardSchema.findById(boardId);
    if (!existedBoard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    const newIssueLinkType = new this.issueLinkTypeSchema({
      ...model,
      boardId,
    });
    await newIssueLinkType.save();
    return newIssueLinkType;
  }
  public async updateLinkIssueType(
    model: UpdateIssueLinkTypeDto,
    issueLinkTypeId: string
  ): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existIssueLinkType = await this.issueLinkTypeSchema
      .findById(issueLinkTypeId)
      .exec();
    if (!existIssueLinkType) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Issue link type not found"
      );
    }
    await this.issueLinkTypeSchema.findByIdAndUpdate(issueLinkTypeId, model);
  }
  public async deleteIssueLinkType(linkIssueTypeId: string): Promise<void> {
    const existIssueLink = await this.issueLinkSchema
      .findOne({
        linkIssueTypeId,
      })
      .exec();
    if (existIssueLink) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Issue link type is used"
      );
    }
    await this.issueLinkTypeSchema.findByIdAndDelete(linkIssueTypeId);
  }
  public async getIssueLinkTypeByBoardId(
    req: Request,
    boardId: string,
    userId: string
  ): Promise<IIssueLinkType[]> {
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
      this.issueLinkTypeSchema.find({
        boardId,
        ...extendCondition,
      }),
      req.query
    )
      .paginate()
      .sort()
      .limit()
      .filter();
    const issueLinkTypes = await feature.query;
    return issueLinkTypes;
  }
}
