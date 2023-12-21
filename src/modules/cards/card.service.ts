import {
  MODEL_NAME,
  OBJECT_ID,
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
export default class CardService {
  private cardSchema = CardSchema;
  private notificationService = new NotificationService();
  private userSchema = UserSchema;
  public async createCard(
    model: CreateCardDto,
    userId: string
  ): Promise<ICard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existColumn = await ColumnSchema.findById(model.columnId).exec();
    if (!existColumn) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not found");
    }
    const existBoard = await BoardSchema.findById(existColumn.boardId).exec();
    if (!existBoard) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not found");
    }
    const checkPermissionCard = await permissionCard(existBoard.id, userId);
    if (!checkPermissionCard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to create card"
      );
    }
    const lengthCardInBoard = await this.cardSchema
      .find({ boardId: existColumn.boardId })
      .count();
    const newCard = await this.cardSchema.create({
      ...model,
      cardId: generateCardId(existBoard.title, lengthCardInBoard),
      boardId: existColumn.boardId,
      reporterId: userId,
    });
    await ColumnSchema.findByIdAndUpdate(
      { _id: new OBJECT_ID(newCard.columnId) },
      { $push: { cardOrderIds: newCard._id }, $set: { updatedAt: Date.now() } },
      { new: true }
    ).exec();
    return newCard;
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
    const checkPermissionCard = await permissionCard(card.boardId, userId);
    if (!checkPermissionCard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to update card"
      );
    }
    const updateCard = await this.cardSchema
      .findByIdAndUpdate(
        { _id: cardId },
        { ...model, updatedAt: Date.now() },
        { new: true }
      )
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
    const member = await UserSchema.findById(assigneeId).exec();
    if (!member) {
      throw new HttpException(StatusCodes.CONFLICT, "User not found");
    }
    const card = await this.cardSchema.findById(cardId).exec();
    if (!card) {
      throw new HttpException(StatusCodes.CONFLICT, "Card not found");
    }
    const checkPermissionCard = await permissionCard(card.boardId, userId);
    if (!checkPermissionCard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to assign member to card"
      );
    }
    const checkBoarMemberByAssignee = await isBoardMember(
      card.boardId,
      assigneeId
    );
    if (!checkBoarMemberByAssignee) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "Assignee is not member of this board"
      );
    }
    const checkCardMember = await isCardNumber(cardId, member.id);
    if (checkCardMember) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "User is already member of this card"
      );
    }
    await this.cardSchema.findByIdAndUpdate(
      {
        _id: cardId,
      },
      {
        $push: { memberIds: member.id },
        $set: { updatedAt: Date.now() },
      },
      { new: true }
    );
    const senderId = await this.userSchema.findById(userId).exec();
    const sender = {
      id: senderId?._id,
      avatar: senderId?.avatar || null,
      name: `${senderId?.firstName} ${senderId?.lastName}`,
    };
    const message = 'have assigned you to the task'
    const model: PushNotificationDto = {
      sender: sender,
      type: MODEL_NAME.board,
      message,
      targetType: card?.title,
      contextUrl: "",
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
    const checkPermissionCard = await permissionCard(existCard.boardId, userId);
    if (!checkPermissionCard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to upload cover card"
      );
    }
    existCard.cover = cover;
    await existCard.save();
    return existCard.cover;
  }
}
