import {
  BOARD_TEMPLATE,
  MODEL_NAME,
  OBJECT_ID,
  SPRINT_STATUS,
  isBoardMember,
  isCardNumber,
  isEmptyObject,
  permissionCard,
  viewedBoardPermission,
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
import PushNotificationDto from "@modules/notifications/dtos/pushNotificationDto";
import { NotificationService } from "@modules/notifications";
import { LabelSchema } from "@modules/labels";
import { PrioritySchema } from "@modules/priority";
import { SprintSchema } from "@modules/sprint";
import { EpicSchema } from "@modules/epic";
import { IssueLinkSchema } from "@modules/issueLink";
import { ITaskLog, TaskLogSchema } from "@modules/taskLog";
import { IssueTypeSchema } from "@modules/issueType";
import { ClientSession } from "mongoose";
import { cloneDeep } from "lodash";
export default class CardService {
  private cardSchema = CardSchema;
  private notificationService = new NotificationService();
  private userSchema = UserSchema;
  private boardSchema = BoardSchema;
  private colSchema = ColumnSchema;
  private labelSchema = LabelSchema;
  private prioritySchema = PrioritySchema;
  private epicSchema = EpicSchema;
  private sprintSchema = SprintSchema;
  private issueLinkSchema = IssueLinkSchema;
  private taskLogSchema = TaskLogSchema;
  private issueTypeSchema = IssueTypeSchema;
  public async createCard(
    model: CreateCardDto,
    userId: string,
    boardId: string,
    session: ClientSession
  ): Promise<ICard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existBoard = await this.boardSchema.findById(boardId).exec();
    if (!existBoard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    if (model.reporterId) {
      const reporter = await this.userSchema.findById(model.reporterId).exec();
      if (!reporter) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Reporter not found");
      }
    }
    if (model.labelId) {
      const label = await this.labelSchema.findById(model.labelId).exec();
      if (!label) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Label not found");
      }
    }
    if (model.priorityId) {
      const priority = await this.prioritySchema
        .findById(model.priorityId)
        .exec();
      if (!priority) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Priority not found");
      }
    }
    if (model.epicId) {
      const epic = await this.epicSchema.findById(model.epicId).exec();
      if (!epic) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Epic not found");
      }
    }
    const issueType = await this.issueTypeSchema
      .findById(model.issueTypeId)
      .exec();
    if (!issueType) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "IssueType not found");
    }

    const lengthCardInBoard = await this.cardSchema.find({ boardId }).count();
    const newCard = await this.cardSchema.create(
      [
        {
          ...model,
          cardId: generateCardId(existBoard.key, lengthCardInBoard),
          boardId: boardId,
          reporterId: !model.reporterId ? userId : model.reporterId,
          columnId: model.columnId ? model.columnId : existBoard.initColumnId,
          assigneeId: model.assigneeId
            ? model.assigneeId
            : existBoard.defaultAssigneeId,
          watcherIds: model.assigneeId ? [userId, model.assigneeId] : [userId],
        },
      ],
      { session }
    );

    if (model.sprintId) {
      const sprint = await this.sprintSchema.findById(model.sprintId).exec();
      if (!sprint) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Sprint not found");
      }
      sprint.cardOrderIds.push(newCard[0]._id);
      await sprint.save({ session });
    } else {
      if (existBoard.template === BOARD_TEMPLATE.scrum) {
        const sprint = await this.sprintSchema
          .findOne({
            boardId,
            status: SPRINT_STATUS.backlog,
          })
          .exec();
        if (sprint) {
          sprint.cardOrderIds.push(newCard[0]._id);
          await sprint.save({ session });
        } else {
          throw new HttpException(
            StatusCodes.BAD_REQUEST,
            "Create card failed"
          );
        }
      }
    }
    if (model.columnId) {
      const existColumn = await this.colSchema.findById(model.columnId).exec();
      if (!existColumn) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Column not found");
      }
      await this.colSchema
        .findByIdAndUpdate(
          { _id: new OBJECT_ID(newCard[0].columnId) },
          { $push: { cardOrderIds: newCard[0]._id } },
          { new: true, session }
        )
        .exec();
    } else {
      const existColumn = await this.colSchema
        .findById(existBoard.initColumnId)
        .exec();
      if (!existColumn) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Column not found");
      }
      await this.colSchema.findByIdAndUpdate(
        { _id: new OBJECT_ID(existBoard.initColumnId) },
        { $push: { cardOrderIds: newCard[0]._id } },
        { new: true, session }
      );
    }
    await this.taskLogSchema.create(
      [
        {
          userId: userId,
          target: "Issue",
          msg: "created the",
          issueModel: MODEL_NAME.card,
          issueId: newCard[0]._id,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return newCard[0];
  }
  public async getDetailCardById(
    cardId: string,
    userId: string
  ): Promise<object> {
    const existed = await this.cardSchema.findById(cardId).exec();
    if (!existed) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }

    const isViewedBoard = await viewedBoardPermission(existed.boardId, userId);
    if (isViewedBoard === false) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not member of this board"
      );
    }
    const card = await this.cardSchema
      .aggregate([
        {
          $match: {
            _id: new OBJECT_ID(cardId),
          },
        },
        {
          $lookup: {
            from: "users",
            let: { reporterId: "$reporterId" },
            localField: "reporterId",
            foreignField: "_id",
            as: "reporter",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$reporterId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: { $concat: ["$firstName", " ", "$lastName"] },
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "labels",
            localField: "labelId",
            let: { labelId: "$labelId" },
            foreignField: "_id",
            as: "label",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$labelId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  color: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            boardId: 1,
            columnId: 1,
            cardId: 1,
            title: 1,
            description: 1,
            cover: 1,
            attachments: 1,
            startDate: 1,
            dueDate: 1,
            createdAt: 1,
            updatedAt: 1,
            reporter: {
              $arrayElemAt: ["$reporter", 0],
            },
            label: {
              $arrayElemAt: ["$label", 0],
            },
            priority: 1,
            isOverdue: 1,
            isActive: 1,
          },
        },
      ])
      .exec();
    if (!card) {
      throw new HttpException(409, "Card not found");
    }

    return card[0];
  }
  public async updateCard(
    cardId: string,
    model: UpdateCardDto,
    userId: string,
    session: ClientSession
  ): Promise<ICard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    const cloneCard = cloneDeep(card);
    const updateCard = await this.cardSchema
      .findByIdAndUpdate({ _id: cardId }, { ...model }, { new: true, session })
      .exec();
    if (!updateCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Update card failed");
    }
    const taskLogs: ITaskLog[] = [];
    if (model.columnId) {
      const oldCol = await this.colSchema.findById(cloneCard.columnId).exec();
      const newCol = await this.colSchema.findById(model.columnId).exec();
      if (!newCol) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Column not found");
      }
      taskLogs.push({
        userId: userId,
        target: "Status",
        msg: "changed the",
        oldVal: (oldCol || {}).title,
        newVal: newCol.title,
        issueModel: MODEL_NAME.card,
        issueId: card._id,
      });
    }
    if (model.title) {
      taskLogs.push({
        userId: userId,
        target: "Title",
        msg: "changed the",
        oldVal: cloneCard.title,
        newVal: model.title,
        issueModel: MODEL_NAME.card,
        issueId: card._id,
      });
    }
    if (model.description) {
      taskLogs.push({
        userId: userId,
        target: "Description",
        msg: "changed the",
        oldVal: JSON.stringify(cloneCard.description),
        newVal: JSON.stringify(model.description),
        issueModel: MODEL_NAME.card,
        issueId: card._id,
      });
    }
    if (model.labelId) {
      const oldLabel = await this.labelSchema
        .findById(cloneCard.labelId)
        .exec();
      const newLabel = await this.labelSchema.findById(model.labelId).exec();
      if (!newLabel) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Label not found");
      }
      taskLogs.push({
        userId: userId,
        target: "Label",
        msg: "changed the",
        oldVal: (oldLabel || {}).name,
        newVal: newLabel.name,
        issueModel: MODEL_NAME.card,
        issueId: card._id,
      });
    }
    if (model.priorityId) {
      const oldPriority = await this.prioritySchema
        .findById(cloneCard.priorityId)
        .exec();
      const newPriority = await this.prioritySchema.findById(model.priorityId);
      if (!newPriority) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Priority not found");
      }
      taskLogs.push({
        userId: userId,
        target: "Priority",
        msg: "changed the",
        oldVal: (oldPriority || {}).name,
        newVal: newPriority.name,
        issueModel: MODEL_NAME.card,
        issueId: card._id,
      });
    }
    if (model.sprintId) {
      const oldSprint = await this.sprintSchema.findById(cloneCard.sprintId);
      const newSprint = await this.sprintSchema.findById(model.sprintId);
      if (!newSprint) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Sprint not found");
      }
      taskLogs.push({
        userId: userId,
        target: "Sprint",
        msg: "changed the",
        oldVal: (oldSprint || {}).name,
        newVal: newSprint.name,
        issueModel: MODEL_NAME.card,
        issueId: card._id,
      });
    }
    if (model.epicId) {
      const oldEpic = await this.epicSchema.findById(cloneCard.epicId);
      const newEpic = await this.epicSchema.findById(model.epicId);
      if (!newEpic) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Epic not found");
      }
      taskLogs.push({
        userId: userId,
        target: "Epic",
        msg: "changed the",
        oldVal: (oldEpic || {}).name,
        newVal: newEpic.name,
        issueModel: MODEL_NAME.card,
        issueId: card._id,
      });
    }
    if (model.issueTypeId) {
      const oldIssueType = await this.issueTypeSchema
        .findById(cloneCard.issueTypeId)
        .exec();
      const newIssueType = await this.issueTypeSchema
        .findById(model.issueTypeId)
        .exec();
      if (!newIssueType) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "IssueType not found");
      }
      taskLogs.push({
        userId: userId,
        target: "IssueType",
        msg: "changed the",
        oldVal: (oldIssueType || {}).name,
        newVal: newIssueType.name,
        issueModel: MODEL_NAME.card,
        issueId: card._id,
      });
    }
    if (model.storyPoint) {
      taskLogs.push({
        userId: userId,
        target: "StoryPoint",
        msg: "changed the",
        oldVal: cloneCard.storyPoint.toString(),
        newVal: model.storyPoint.toString(),
        issueModel: MODEL_NAME.card,
        issueId: card._id,
      });
    }
    if (taskLogs.length) {
      await this.taskLogSchema.create(taskLogs, { session });
    }
    await session.commitTransaction();
    session.endSession();
    return updateCard;
  }
  public async assignMemberToCard(
    userId: string,
    cardId: string,
    assigneeId: string,
    session: ClientSession
  ): Promise<void> {
    const member = await this.userSchema.findById(assigneeId).exec();
    if (!member) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "User not found");
    }
    const card = await this.cardSchema
      .findOne({
        _id: cardId,
        isActive: true,
      })
      .exec();
    if (!card) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    const cloneCard = cloneDeep(card);
    const checkBoarMemberByAssignee = await isBoardMember(
      card.boardId,
      assigneeId
    );
    if (!checkBoarMemberByAssignee) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Assignee is not member of this board"
      );
    }
    const assignee = await this.userSchema.findById(assigneeId);
    const currentAssignee = await this.userSchema.findById(
      cloneCard.memberIds[0]
    );
    if (!assignee) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "User not found");
    }
    await this.cardSchema.findByIdAndUpdate(
      {
        _id: cardId,
      },
      {
        $set: {
          memberIds: [assigneeId],
          watcherIds: [...new Set([...cloneCard.watcherIds, assigneeId])],
        },
      },
      { new: true, session }
    );

    await this.taskLogSchema.create(
      [
        {
          userId: userId,
          target: "Assignee",
          msg: "changed the",
          oldVal: currentAssignee
            ? `${currentAssignee.firstName} ${currentAssignee.lastName}`
            : null,
          newVal: `${assignee.firstName} ${assignee.lastName}`,
          issueModel: MODEL_NAME.card,
          issueId: card._id,
        },
      ],
      { session }
    );
    const board = await this.boardSchema.findById(card.boardId).exec();
    const message = "have assigned you to the task";
    const model: PushNotificationDto = {
      senderId: userId,
      targetType: card.title,
      message,
      type: {
        name: board?.title || null,
        category: MODEL_NAME.board,
      },
      contextUrl: `${process.env.URL_CLIENT}/u/boards/${board?._id}/cards/${cardId}`,
      receiverId: assigneeId,
    };
    await this.notificationService.pushNotification(model);
    await session.commitTransaction();
    session.endSession();
  }
  public async getMemberInCard(
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
    const card = await this.cardSchema.aggregate([
      {
        $match: {
          _id: new OBJECT_ID(cardId),
          isActive: true,
        },
      },
      {
        $unwind: {
          path: "$memberIds",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { memberIds: "$memberIds" },
          localField: "memberIds",
          foreignField: "_id",
          as: "members",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$memberIds"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: "$_id",
          members: {
            $push: {
              $arrayElemAt: ["$members", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          members: 1,
        },
      },
    ]);
    if (!card) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    return card[0];
  }
  public async uploadCoverCard(
    userId: string,
    cardId: string,
    cover: string
  ): Promise<String> {
    const existCard = await this.cardSchema.findById(cardId).exec();
    if (!existCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    existCard.cover = cover;
    await existCard.save();
    return existCard.cover;
  }
  public async unAssignMemberFromCard(
    cardId: string,
    userId: string,
    session: ClientSession
  ): Promise<void> {
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    const cloneCard = cloneDeep(card);
    await this.cardSchema.findByIdAndUpdate(
      {
        _id: cardId,
      },
      {
        $set: {
          memberIds: [],
          watcherIds: card.watcherIds.filter(
            (id) => id.toString() !== card.memberIds[0].toString()
          ),
        },
      },
      { new: true, session }
    );
    const currentAssignee = await this.userSchema
      .findById(cloneCard.memberIds[0])
      .exec();
    if (!currentAssignee) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Assignee not found");
    }
    await this.taskLogSchema.create(
      [
        {
          userId: userId,
          target: "Assignee",
          msg: "changed the",
          oldVal: `${currentAssignee?.firstName} ${currentAssignee?.lastName}`,
          newVal: null,
          issueModel: MODEL_NAME.card,
          issueId: card._id,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
  }
  public async deleteCard(cardId: string, userId: string): Promise<void> {
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not found");
    }
    const deletedCard = await this.cardSchema
      .findByIdAndUpdate(
        cardId,
        {
          isActive: false,
        },
        { new: true }
      )
      .exec();
    if (!deletedCard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Card not deleted");
    }
    await ColumnSchema.findByIdAndUpdate(
      { _id: new OBJECT_ID(deletedCard.columnId) },
      {
        $pull: { cardOrderIds: deletedCard._id },
      },
      { new: true }
    ).exec();
  }
  public async cardAssignedToMe(userId: string): Promise<Object[]> {
    const assignedToMe = await this.cardSchema
      .aggregate([
        {
          $lookup: {
            from: "boards",
            localField: "boardId",
            foreignField: "_id",
            as: "boards",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  title: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "labels",
            localField: "labelId",
            foreignField: "_id",
            as: "labels",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  color: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "columns",
            localField: "columnId",
            foreignField: "_id",
            as: "columns",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  title: 1,
                },
              },
            ],
          },
        },
        {
          $match: {
            memberIds: {
              $in: [new OBJECT_ID(userId)],
            },
            isActive: { $eq: true },
          },
        },
        {
          $project: {
            _id: 1,
            board: {
              $arrayElemAt: ["$boards", 0],
            },
            column: {
              $arrayElemAt: ["$columns", 0],
            },
            cardId: 1,
            title: 1,
            description: 1,
            startDate: 1,
            dueDate: 1,
            priority: 1,
            labels: 1,
          },
        },
      ])
      .exec();
    return assignedToMe;
  }
}
