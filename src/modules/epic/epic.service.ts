import { MODEL_NAME, isEmptyObject } from "@core/utils";

import { HttpException } from "@core/exceptions";
import { BoardSchema } from "@modules/boards";
import { StatusCodes } from "http-status-codes";
import { EpicSchema } from ".";
import CreateEpicDto from "./dtos/createEpicDto";
import IEpic from "./epic.interface";
import { ClientSession } from "mongoose";
import { ITaskLog, TaskLogSchema } from "@modules/taskLog";
import UpdateEpicDto from "./dtos/updateEpicDto";
import { cloneDeep } from "lodash";
import dayjs from "dayjs";
import { LabelSchema } from "@modules/labels";
import { UserSchema } from "@modules/users";
import { ColumnSchema } from "@modules/columns";
import { IssueTypeSchema } from "@modules/issueType";

export default class EpicService {
  private epicSchema = EpicSchema;
  private boardSchema = BoardSchema;
  private taskLogSchema = TaskLogSchema;
  private labelSchema = LabelSchema;
  private userSchema = UserSchema;
  private columnSchema = ColumnSchema;
  private issueTypeSchema = IssueTypeSchema;
  public async createEpic(
    model: CreateEpicDto,
    boardId: string,
    userId: string,
    session: ClientSession
  ): Promise<IEpic> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    const existEpic = await this.epicSchema.findOne({
      title: model.name,
      boardId,
    });

    if (existEpic) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        `Column with title ${model.name} already exists`
      );
    }

    const issueType = await this.issueTypeSchema.findById(model.issueTypeId);
    if (!issueType) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "IssueType not found");
    }
    if (issueType.hierarchy !== 1) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "IssueType must be of type Epic"
      );
    }

    const newEpic = await this.epicSchema.create(
      [
        {
          ...model,
          boardId,
          columnId: board.initColumnId,
        },
      ],
      { session: session }
    );
    if (!newEpic) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Column not created");
    }
    await this.taskLogSchema.create(
      [
        {
          userId: userId,
          target: "Epic",
          msg: "created the",
          issueModel: MODEL_NAME.epic,
          issueId: newEpic[0]._id,
        },
      ],
      {
        session: session,
      }
    );
    await session.commitTransaction();
    session.endSession();
    return newEpic[0];
  }
  public updateEpic = async (
    model: UpdateEpicDto,
    boardId: string,
    userId: string,
    session: ClientSession,
    epicId: string
  ): Promise<void> => {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    const existEpic = await this.epicSchema
      .findOne({
        title: model.name,
        _id: { $ne: epicId },
        boardId,
      })
      .exec();
    if (existEpic) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        `Column with title ${model.name} already exists`
      );
    }
    const epic = await this.epicSchema.findById(epicId).exec();
    if (!epic) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Epic not found");
    }
    const cloneEpic = cloneDeep(epic);
    await this.epicSchema
      .findByIdAndUpdate(
        { _id: epicId },
        {
          ...model,
        },
        { new: true, session }
      )
      .exec();
    const taskLogs: ITaskLog[] = [];
    if (model.name) {
      taskLogs.push({
        userId,
        target: "Name",
        msg: "changed the",
        oldVal: cloneEpic.name,
        newVal: model.name,
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (model.description) {
      taskLogs.push({
        userId,
        target: "Description",
        msg: "changed the",
        oldVal: cloneEpic.description,
        newVal: model.description,
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (model.startDate) {
      taskLogs.push({
        userId,
        target: "Start date",
        msg: "changed the",
        oldVal: dayjs(cloneEpic.startDate).format("YYYY-MM-DD"),
        newVal: dayjs(model.startDate).format("YYYY-MM-DD"),
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (model.dueDate) {
      taskLogs.push({
        userId,
        target: "Due date",
        msg: "changed the",
        oldVal: dayjs(cloneEpic.dueDate).format("YYYY-MM-DD"),
        newVal: dayjs(model.dueDate).format("YYYY-MM-DD"),
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (model.color) {
      taskLogs.push({
        userId,
        target: "Color",
        msg: "changed the",
        oldVal: cloneEpic.color,
        newVal: model.color,
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (model.labelId) {
      const oldLabel = await this.labelSchema
        .findById(cloneEpic.labelId)
        .exec();
      const newLabel = await this.labelSchema.findById(model.labelId).exec();
      if (!newLabel) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Label not found");
      }
      taskLogs.push({
        userId,
        target: "Label",
        msg: "changed the",
        oldVal: (oldLabel || {}).name,
        newVal: newLabel.name,
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (model.assigneeId) {
      const oldAssignee = await this.userSchema
        .findById(cloneEpic.assigneeId)
        .exec();
      const newAssignee = await this.userSchema
        .findById(model.assigneeId)
        .exec();
      if (!oldAssignee || !newAssignee) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Assignee not found");
      }
      taskLogs.push({
        userId,
        target: "Assignee",
        msg: "changed the",
        oldVal: `${oldAssignee.firstName} ${oldAssignee.lastName}`,
        newVal: `${newAssignee.firstName} ${newAssignee.lastName}`,
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (model.columnId) {
      const oldColumn = await this.columnSchema.findById(cloneEpic.columnId);
      const newColumn = await this.columnSchema.findById(model.columnId);
      if (!newColumn) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Column not found");
      }
      taskLogs.push({
        userId,
        target: "Status",
        msg: "changed the",
        oldVal: (oldColumn || {}).title,
        newVal: newColumn.title,
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (model.cardOrderIds) {
      taskLogs.push({
        userId,
        target: "card in Epic",
        msg: "changed",
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (model.issueTypeId) {
      const oldIssueType = await this.issueTypeSchema.findById(
        cloneEpic.issueTypeId
      );
      const newIssueType = await this.issueTypeSchema.findById(
        model.issueTypeId
      );
      if (!newIssueType) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "IssueType not found");
      }
      if (newIssueType.hierarchy !== 1) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "IssueType must be of type Epic"
        );
      }
      taskLogs.push({
        userId,
        target: "Issue Type",
        msg: "changed the",
        oldVal: (oldIssueType || {}).name,
        newVal: newIssueType.name,
        issueModel: MODEL_NAME.epic,
        issueId: epic._id,
      });
    }
    if (taskLogs.length) {
      await this.taskLogSchema.create(taskLogs, {
        session,
      });
    }
    await session.commitTransaction();
    session.endSession();
  };
}
