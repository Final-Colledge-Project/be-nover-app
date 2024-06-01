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
import { TaskLogSchema } from "@modules/taskLog";
import { IssueTypeSchema } from "@modules/issueType";
import { ClientSession } from "mongoose";
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
    if (model.assigneeId) {
      const assignee = await this.userSchema.findById(model.assigneeId).exec();
      if (!assignee) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Assignee not found");
      }
    }

    if (model.issueLinks) {
      const issueLinkIds = model.issueLinks.map((item) => item.linkType) || [];
      const issueLink = await this.issueLinkSchema
        .find({ _id: { $in: issueLinkIds } })
        .exec();
      if ((issueLinkIds || []).length !== issueLink.length) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "IssueLink not found");
      }
      const issueIds = model.issueLinks.map((item) => item.issueId) || [];
      const issue = await this.cardSchema
        .find({ _id: { $in: issueIds } })
        .exec();
      if ((issueIds || []).length !== issue.length) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Issue not found");
      }
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
      await ColumnSchema.findByIdAndUpdate(
        { _id: new OBJECT_ID(newCard[0].columnId) },
        { $push: { cardOrderIds: newCard[0]._id } },
        { new: true, session }
      ).exec();
    }
    await this.taskLogSchema.create(
      [
        {
          userId: userId,
          target: "Issue",
          msg: "created the",
        },
      ],
      { session }
    );
    return newCard[0];
  }
  public async getDetailCardById(
    cardId: string,
    userId: string
  ): Promise<object> {
    const existed = await this.cardSchema.findById(cardId).exec();
    if (!existed) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
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
    userId: string
  ): Promise<ICard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    const updateCard = await this.cardSchema
      .findByIdAndUpdate({ _id: cardId }, { ...model }, { new: true })
      .exec();
    if (!updateCard) {
      throw new HttpException(StatusCodes.CONFLICT, "Update card failed");
    }
    return updateCard;
  }
  public async assignMemberToCard(
    userId: string,
    cardId: string,
    assigneeId: string
  ): Promise<void> {
    const member = await this.userSchema.findById(assigneeId).exec();
    if (!member) {
      throw new HttpException(StatusCodes.CONFLICT, "User not found");
    }
    const card = await this.cardSchema
      .findOne({
        _id: cardId,
        isActive: true,
      })
      .exec();
    if (!card) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
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
    await this.cardSchema.findByIdAndUpdate(
      {
        _id: cardId,
      },
      {
        $set: { memberIds: [assigneeId] },
      },
      { new: true }
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
  }
  public async getMemberInCard(
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
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
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
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    existCard.cover = cover;
    await existCard.save();
    return existCard.cover;
  }
  public async unAssignMemberFromCard(cardId: string): Promise<void> {
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    await this.cardSchema.findByIdAndUpdate(
      {
        _id: cardId,
      },
      {
        $set: { memberIds: [] },
      },
      { new: true }
    );
  }
  public async deleteCard(cardId: string, userId: string): Promise<void> {
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
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
      throw new HttpException(StatusCodes.CONFLICT, "Card not deleted");
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
