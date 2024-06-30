import { IssueLinkTypeSchema } from "@modules/issueLinkTypes";
import AddIssueLinkDto, { IssueDto } from "./dtos/addIssueLinkDto";
import IIssueLink, { ICommonIssue } from "./issueLink.interface";
import IssueLinkSchema from "./issueLink.model";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import mongoose, { ClientSession, ObjectId } from "mongoose";
import {
  DIRECTION_TYPE,
  MODEL_NAME,
  OBJECT_ID,
  getMsgLogIssue,
  isJsonString,
  upperCaseFirstLetter,
} from "@core/utils";
import { ITaskLog, TaskLogSchema } from "@modules/taskLogs";
import { EpicSchema, IEpic } from "@modules/epics";
import { CardSchema } from "@modules/cards";
import { SubCardSchema } from "@modules/subCards";
import APIFeatures from "@core/utils/apiFeature";
import { Request } from "express";
export default class IssueLinkService {
  private issueLinkSchema = IssueLinkSchema;
  private issueLinkTypeSchema = IssueLinkTypeSchema;
  private taskLogSchema = TaskLogSchema;
  private epicSchema = EpicSchema;
  private cardSchema = CardSchema;
  private subCardSchema = SubCardSchema;
  public async addIssueLink(
    model: AddIssueLinkDto,
    boardId: string,
    userId: string,
    session: ClientSession
  ): Promise<IIssueLink> {
    const existIssueType = await this.issueLinkTypeSchema
      .findById(model.issueLinkTypeId)
      .exec();
    if (!existIssueType) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Issue link type not found"
      );
    }
    const sourceIssue: IssueDto = isJsonString(model.source)
      ? JSON.parse(model.source)
      : {};
    const targetIssue: IssueDto[] = isJsonString(model.target)
      ? JSON.parse(model.target)
      : [];
    const formatTargetIssue = targetIssue.map((target) => {
      return {
        issueModel: target.model,
        issueId: target.id,
        direction:
          model.direction === DIRECTION_TYPE.inward
            ? DIRECTION_TYPE.outward
            : DIRECTION_TYPE.inward,
      };
    });
    const newIssueLink = await this.issueLinkSchema.create(
      [
        {
          boardId,
          sourceIssue: {
            issueModel: sourceIssue.model,
            issueId: sourceIssue.id,
            direction: model.direction,
          },
          targetIssue: formatTargetIssue,
          linkIssueTypeId: model.issueLinkTypeId,
        },
      ],
      { session }
    );
    const epicIssueId = targetIssue
      .filter((item) => item.model === MODEL_NAME.epic)
      .map((item) => item.id);
    const cardIssueId = targetIssue
      .filter((item) => item.model === MODEL_NAME.card)
      .map((item) => item.id);
    const subCardId = targetIssue
      .filter((item) => item.model === MODEL_NAME.subCard)
      .map((item) => item.id);

    if (sourceIssue.model === MODEL_NAME.epic) {
      epicIssueId.push(sourceIssue.id);
    }
    if (sourceIssue.model === MODEL_NAME.card) {
      cardIssueId.push(sourceIssue.id);
    }
    if (sourceIssue.model === MODEL_NAME.subCard) {
      subCardId.push(sourceIssue.id);
    }

    const issue: ICommonIssue[] = [];

    if (epicIssueId.length > 0) {
      const objectIdArray = epicIssueId.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const epic = await this.epicSchema.find({
        _id: { $in: objectIdArray },
      });
      if (epicIssueId.length !== epic.length) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Epic not found in the board"
        );
      }
      const epicIssue = epic.map((item) => {
        return {
          id: item._id,
          name: item.name,
          model: MODEL_NAME.epic,
        };
      });
      issue.push(...epicIssue);
    }

    if (cardIssueId.length > 0) {
      const objectIdArray = cardIssueId.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const card = await this.cardSchema.find({
        _id: { $in: objectIdArray },
      });
      if (cardIssueId.length !== card.length) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Card not found in the board"
        );
      }
      const cardIssue = card.map((item) => {
        return {
          id: item._id,
          name: item.title,
          model: MODEL_NAME.card,
        };
      });
      issue.push(...cardIssue);
    }

    if (subCardId.length > 0) {
      const objectIdArray = subCardId.map(
        (item) => new mongoose.Types.ObjectId(item)
      );
      const subCard = await this.subCardSchema.find({
        _id: { $in: objectIdArray },
      });
      if (subCardId.length !== subCard.length) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "SubCard not found in the board"
        );
      }
      const subCardIssue = subCard.map((item) => {
        return {
          id: item._id,
          name: item.name,
          model: MODEL_NAME.subCard,
        };
      });
      issue.push(...subCardIssue);
    }

    const taskLogs: ITaskLog[] = [];

    targetIssue.forEach((item) => {
      const targetName =
        (issue || []).find((item) => item?.id === item?.id)?.name || "";
      const taskLogSource: ITaskLog = {
        userId,
        target: "the Link",
        msg: "created",
        issueModel: upperCaseFirstLetter(item.model.toLowerCase()),
        issueId: item.id,
        oldVal: "",
        newVal: getMsgLogIssue(model.direction, targetName, existIssueType),
      };
      taskLogs.push(taskLogSource);
    });

    const sourceTargetName =
      (issue || []).find((item) => item?.id === sourceIssue?.id)?.name || "";
    taskLogs.push({
      userId,
      target: "the Link",
      msg: "created",
      issueModel: upperCaseFirstLetter(sourceIssue.model.toLowerCase()),
      issueId: sourceIssue.id,
      oldVal: "",
      newVal: getMsgLogIssue(model.direction, sourceTargetName, existIssueType),
    });
    await this.taskLogSchema.create(taskLogs, { session });
    await session.commitTransaction();
    session.endSession();
    return newIssueLink[0];
  }
  public deleteIssueLink = async (
    linkIssueId: string,
    session: ClientSession,
    userId: string
  ) => {
    const existIssueLink = await this.issueLinkSchema
      .findById(linkIssueId)
      .exec();
    if (!existIssueLink) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Issue link not found");
    }

    const issueType = await this.issueLinkTypeSchema
      .findById(existIssueLink.linkIssueTypeId)
      .exec();

    if (!issueType) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Issue link type not found"
      );
    }

    const epicIssueId = existIssueLink.targetIssue
      .filter((item) => item.issueModel === MODEL_NAME.epic)
      .map((item) => item.issueId);
    const cardIssueId = existIssueLink.targetIssue
      .filter((item) => item.issueModel === MODEL_NAME.card)
      .map((item) => item.issueId);
    const subCardId = existIssueLink.targetIssue
      .filter((item) => item.issueModel === MODEL_NAME.subCard)
      .map((item) => item.issueId);

    if (existIssueLink.sourceIssue.issueModel === MODEL_NAME.epic) {
      epicIssueId.push(existIssueLink.sourceIssue.issueId);
    }
    if (existIssueLink.sourceIssue.issueModel === MODEL_NAME.card) {
      cardIssueId.push(existIssueLink.sourceIssue.issueId);
    }
    if (existIssueLink.sourceIssue.issueModel === MODEL_NAME.subCard) {
      subCardId.push(existIssueLink.sourceIssue.issueId);
    }
    const issue: ICommonIssue[] = [];

    if (epicIssueId.length > 0) {
      const epic = await this.epicSchema.find({
        _id: { $in: epicIssueId },
      });
      if (epicIssueId.length !== epic.length) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Epic not found in the board"
        );
      }
      const epicIssue = epic.map((item) => {
        return {
          id: item._id,
          name: item.name,
          model: MODEL_NAME.epic,
        };
      });
      issue.push(...epicIssue);
    }

    if (cardIssueId.length > 0) {
      const card = await this.cardSchema.find({
        _id: { $in: cardIssueId },
      });
      if (cardIssueId.length !== card.length) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Card not found in the board"
        );
      }
      const cardIssue = card.map((item) => {
        return {
          id: item._id,
          name: item.title,
          model: MODEL_NAME.card,
        };
      });
      issue.push(...cardIssue);
    }

    if (subCardId.length > 0) {
      const subCard = await this.subCardSchema.find({
        _id: { $in: subCardId },
      });
      if (subCardId.length !== subCard.length) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "SubCard not found in the board"
        );
      }
      const subCardIssue = subCard.map((item) => {
        return {
          id: item._id,
          name: item.name,
          model: MODEL_NAME.subCard,
        };
      });
      issue.push(...subCardIssue);
    }
    const taskLogs: ITaskLog[] = [];

    existIssueLink.targetIssue.forEach((item) => {
      const targetName =
        (issue || []).find((item) => item?.id === item?.id)?.name || "";
      const taskLogSource: ITaskLog = {
        userId,
        target: "the Link",
        msg: "updated",
        issueModel: item.issueModel,
        issueId: item.issueId,
        oldVal: getMsgLogIssue(item.direction, targetName, issueType),
        newVal: "",
      };
      taskLogs.push(taskLogSource);
    });

    const sourceTargetName =
      (issue || []).find(
        (item) =>
          item?.id.toString() === existIssueLink.sourceIssue?.issueId.toString()
      )?.name || "";
    taskLogs.push({
      userId,
      target: "the Link",
      msg: "updated",
      issueModel: existIssueLink.sourceIssue.issueModel,
      issueId: existIssueLink.sourceIssue.issueId,
      oldVal: getMsgLogIssue(
        existIssueLink.sourceIssue.direction,
        sourceTargetName,
        issueType
      ),
      newVal: "",
    });

    await this.issueLinkSchema
      .findByIdAndDelete(linkIssueId, { session })
      .exec();

    await this.taskLogSchema.create(taskLogs, { session });
    await session.commitTransaction();
    session.endSession();
  };
  public getIssueLinksByIssue = async (req: Request): Promise<IIssueLink[]> => {
    const feature = new APIFeatures(
      this.issueLinkSchema.find({
        $or: [
          {
            "sourceIssue.issueId": new OBJECT_ID(req.params.issueId),
          },
          {
            targetIssue: {
              $elemMatch: {
                issueId: new OBJECT_ID(req.params.issueId),
              },
            },
          },
        ],
      }),
      req.query
    ).paginate();
    const issueLink = await feature.query;
    return issueLink;
  };
}
