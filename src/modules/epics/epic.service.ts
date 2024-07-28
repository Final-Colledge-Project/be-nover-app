import { MODEL_NAME, OBJECT_ID, isEmptyObject } from "@core/utils";

import { HttpException } from "@core/exceptions";
import { BoardSchema } from "@modules/boards";
import { StatusCodes } from "http-status-codes";
import { EpicSchema } from ".";
import CreateEpicDto from "./dtos/createEpicDto";
import IEpic, { IComment } from "./epic.interface";
import { ClientSession } from "mongoose";
import { ITaskLog, TaskLogSchema } from "@modules/taskLogs";
import UpdateEpicDto from "./dtos/updateEpicDto";
import { cloneDeep } from "lodash";
import dayjs from "dayjs";
import { LabelSchema } from "@modules/labels";
import { UserSchema } from "@modules/users";
import { ColumnSchema } from "@modules/columns";
import { IssueTypeSchema } from "@modules/issueTypes";
import AddCommentDto from "./dtos/addCommentDto";
import UpdateCommentDto from "./dtos/updateCommentDto";
import { PrioritySchema } from "@modules/priorities";

export default class EpicService {
  private epicSchema = EpicSchema;
  private boardSchema = BoardSchema;
  private taskLogSchema = TaskLogSchema;
  private labelSchema = LabelSchema;
  private userSchema = UserSchema;
  private columnSchema = ColumnSchema;
  private issueTypeSchema = IssueTypeSchema;
  private prioritySchema = PrioritySchema;
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
    if (model.labelId) {
      const label = await this.labelSchema
        .findOne({ _id: model.labelId, boardId: boardId })
        .exec();
      if (!label) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Label not found");
      }
    }
    if (model.priorityId) {
      const priority = await this.prioritySchema
        .findOne({ _id: model.priorityId, boardId: boardId })
        .exec();
      if (!priority) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Priority not found");
      }
    }
    const issueType = await this.issueTypeSchema
      .findOne({ _id: model.issueTypeId, boardId: boardId })
      .exec();
    if (!issueType) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "IssueType not found");
    }
    if (issueType.hierarchy !== 1) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "IssueType is not suitable for issue"
      );
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

    const newEpic = await this.epicSchema.create(
      [
        {
          ...model,
          boardId,
          columnId: board.initColumnId,
          creatorId: userId,
          epicId: board.nextAutoIncrement.toString(),
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
    board.nextAutoIncrement += 1;
    await board.save({ session });
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
    if (model.labelId) {
      const label = await this.labelSchema
        .findOne({ _id: model.labelId, boardId: boardId })
        .exec();
      if (!label) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Label not found");
      }
    }
    if (model.priorityId) {
      const priority = await this.prioritySchema
        .findOne({ _id: model.priorityId, boardId: boardId })
        .exec();
      if (!priority) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Priority not found");
      }
    }
    const issueType = await this.issueTypeSchema
      .findOne({ _id: model.issueTypeId, boardId: boardId })
      .exec();
    if (!issueType) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "IssueType not found");
    }
    if (issueType.hierarchy !== 1) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "IssueType is not suitable for issue"
      );
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
      if (!newAssignee) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Assignee not found");
      }
      taskLogs.push({
        userId,
        target: "Assignee",
        msg: "changed the",
        oldVal: `${oldAssignee?.firstName} ${oldAssignee?.lastName}`,
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

  public async getEpicDetailByBoardId(
    epicId: string,
    boardId: string
  ): Promise<IEpic[]> {
    console.log("🚀 ~ EpicService ~ epicId:", epicId);
    console.log("🚀 ~ EpicService ~ boardId:", boardId);
    const epic = await this.epicSchema
      .aggregate([
        {
          $match: {
            _id: new OBJECT_ID(epicId),
          },
        },
        {
          $lookup: {
            from: "cards",
            localField: "cardOrderIds",
            foreignField: "_id",
            as: "cards",
            pipeline: [
              {
                $match: {
                  boardId: new OBJECT_ID(boardId),
                },
              },
              {
                $lookup: {
                  from: "columns",
                  localField: "columnId",
                  foreignField: "_id",
                  as: "column",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        title: 1,
                        isResolved: 1,
                      },
                    },
                  ],
                },
              },
              {
                $lookup: {
                  from: "issuetypes",
                  localField: "issueTypeId",
                  foreignField: "_id",
                  as: "issueType",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                      },
                    },
                  ],
                },
              },
              {
                $lookup: {
                  from: "users",
                  let: {
                    memberIds: "$memberIds",
                  },
                  localField: "memberIds",
                  foreignField: "_id",
                  as: "members",
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: ["$_id", "$$memberIds"],
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        fullName: {
                          $concat: ["$firstName", " ", "$lastName"],
                        },
                        avatar: 1,
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  column: {
                    $arrayElemAt: ["$column", 0],
                  },
                  issueType: {
                    $arrayElemAt: ["$issueType", 0],
                  },
                  storyPoint: 1,
                  assignee: {
                    $arrayElemAt: ["$members", 0],
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            startDate: 1,
            dueDate: 1,
            cards: 1,
            color: 1,
            columnId: 1,
            assigneeId: 1,
            labelId: 1,
            comments: 1,
            attachments: 1,
            issueTypeId: 1,
            priorityId: 1,
            creatorId: 1,
            isActive: 1,
            boardId: 1,
          },
        },
      ])
      .exec();
    return epic;
  }
  public getEpicsByBoardId = async (boardId: string): Promise<IEpic[]> => {
    const epic = await this.epicSchema
      .find({
        boardId,
      })
      .exec();
    if (!epic) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Epic not found");
    }
    return epic;
  };
  public async addCommentToEpic(
    userId: string,
    model: AddCommentDto,
    epicId: string,
    session: ClientSession
  ) {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const epic = await this.epicSchema.findById(epicId).exec();
    if (!epic) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Epic not found");
    }
    const comment: IComment = {
      userId,
      content: model.content,
      icon: model.icon,
      createdAt: new Date(),
      updatedAt: new Date(),
      edited: false,
      likeIds: [],
    };
    epic.comments.push(comment);
    await epic.save();
    await session.commitTransaction();
    session.endSession();
  }
  public async updateCommentInEpic(
    epicId: string,
    userId: string,
    model: UpdateCommentDto,
    commentId: string,
    session: ClientSession
  ) {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const epic = await this.epicSchema.findById(epicId).exec();
    if (!epic) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Epic not found");
    }
    const comment = epic.comments.find((c) => c?._id?.toString() === commentId);
    if (userId !== comment?.userId.toString()) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not owner of this comment"
      );
    }
    if (model.content) {
      comment.content = model.content;
    }
    if (model.icon) {
      comment.icon = model.icon;
    }
    if (model.likeIds) {
      comment.likeIds = model.likeIds;
    }
    comment.updatedAt = new Date();
    comment.edited = true;
    await epic.save();
    await session.commitTransaction();
    session.endSession();
  }
  public async deleteCommentInEpic(
    cardId: string,
    userId: string,
    commentId: string
  ): Promise<void> {
    const epic = await this.epicSchema.findById(cardId).exec();
    if (!epic) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Epic not found");
    }
    const comment = epic.comments.find((c) => c?._id?.toString() === commentId);
    if (userId !== comment?.userId.toString()) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not owner of this comment"
      );
    }
    epic.comments = epic.comments.filter(
      (c) => c?._id?.toString() !== commentId
    );
    await epic.save();
  }
  public async getCommentsInEpic(epicId: string): Promise<IComment[]> {
    const epic = await this.epicSchema
      .findById(epicId)
      .populate("comments.userId", "firstName lastName avatar email")
      .exec();
    if (!epic) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    return epic.comments;
  }
}
