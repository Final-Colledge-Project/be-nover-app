import { BoardSchema } from "@modules/boards";
import { IssueTypeSchema } from ".";
import { CardSchema } from "@modules/cards";
import { EpicSchema } from "@modules/epics";
import { SubCardSchema } from "@modules/subCards";
import CreateIssueTypeDto from "./dtos/createIssueTypeDto";
import IIssueType from "./issueType.interface";
import { isBoardMember, isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import UpdateIssueTypeDto from "./dtos/updateIssueTypeDto";
import { Request } from "express";
import APIFeatures from "@core/utils/apiFeature";
import { assign } from "lodash";
export default class IssueTypeService {
  private boardSchema = BoardSchema;
  private issueTypeSchema = IssueTypeSchema;
  private cardSChema = CardSchema;
  private epicSchema = EpicSchema;
  private subCardSchema = SubCardSchema;
  public async createIssueType(
    model: CreateIssueTypeDto,
    boardId: string
  ): Promise<IIssueType> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existedBoard = await this.boardSchema.findById(boardId);
    if (!existedBoard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    const newIssueType = new this.issueTypeSchema({
      ...model,
      boardId,
    });
    await newIssueType.save();
    return newIssueType;
  }
  public async updateIssueType(
    model: UpdateIssueTypeDto,
    issueTypeId: string
  ): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existIssueType = await this.issueTypeSchema
      .findById(issueTypeId)
      .exec();
    if (!existIssueType) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Issue type not found");
    }
    await this.issueTypeSchema.findByIdAndUpdate(issueTypeId, model);
  }
  public async deleteIssueType(issueTypeId: string): Promise<void> {
    const existIssueType = await this.issueTypeSchema.findById(issueTypeId);
    if (!existIssueType) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Issue type not found");
    }
    const distinctIdsInCard = await this.cardSChema.distinct("issueTypeId");
    const distinctIdsInEpic = await this.epicSchema.distinct("issueTypeId");
    const distinctIdsInSubCard = await this.subCardSchema.distinct(
      "issueTypeId"
    );
    const distinctIds = [
      ...new Set([
        ...distinctIdsInCard,
        ...distinctIdsInEpic,
        ...distinctIdsInSubCard,
      ]),
    ];
    const issueTypesInUse = await this.issueTypeSchema
      .find({
        _id: { $in: distinctIds },
      })
      .exec();
    const isUsed = issueTypesInUse.some(
      (item) => item._id.toString() === issueTypeId.toString()
    );
    if (isUsed) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Issue type is in use");
    }
    const existHierarchy = await this.issueTypeSchema.find({
      hierarchy: existIssueType.hierarchy,
    });
    if (existHierarchy.length === 0) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Cannot delete the last issue type of this hierarchy"
      );
    }
    const existSubCard = await this.subCardSchema
      .findOne({
        issueTypeId,
      })
      .exec();
    if (existSubCard) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Sub card with this issue type exists"
      );
    }
    await this.issueTypeSchema.findByIdAndDelete(issueTypeId);
  }
  public async getIssueTypeByBoardId(
    req: Request,
    boardId: string,
    userId: string
  ): Promise<IIssueType[]> {
    const isMem = await isBoardMember(boardId, userId);
    if (!isMem) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }

    const distinctIdsInCard = await this.cardSChema.distinct("issueTypeId");
    const distinctIdsInEpic = await this.epicSchema.distinct("issueTypeId");
    const distinctIdsInSubCard = await this.subCardSchema.distinct(
      "issueTypeId"
    );
    const distinctIds = [
      ...new Set([
        ...distinctIdsInCard,
        ...distinctIdsInEpic,
        ...distinctIdsInSubCard,
      ]),
    ];
    const issueTypesInUse = await this.issueTypeSchema
      .find({
        _id: { $in: distinctIds },
      })
      .exec();

    let extendCondition = {};
    if (req.query.search) {
      extendCondition = {
        name: { $regex: req.query.search, $options: "i" },
      };
    }
    const feature = new APIFeatures(
      this.issueTypeSchema.find({
        boardId,
        ...extendCondition,
      }),
      req.query
    )
      .paginate()
      .sort()
      .limit()
      .filter();
    const issueTypes = await feature.query;

    return issueTypes.map((issueType: IIssueType) => {
      const isUsed = issueTypesInUse.some(
        (item) => item._id.toString() === issueType._id.toString()
      );
      return assign({}, issueType.toObject(), { canDelete: !isUsed });
    });
  }
}
