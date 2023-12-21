import {
  MODEL_NAME,
  OBJECT_ID,
  ROLE,
  isBoardAdmin,
  isBoardLead,
  isBoardMember,
  isEmptyObject,
  isSuperAdmin,
  isWorkspaceMember,
  permissionBoard,
  permissionWorkspace,
  viewWorkspacePermission,
  viewedBoardPermission,
} from "@core/utils";
import IBoard from "./board.interface";
import BoardSchema from "./board.model";
import CreateBoardDto from "./dtos/createBoardDto";
import { HttpException } from "@core/exceptions";
import { Request } from "express";
import APIFeatures from "@core/utils/apiFeature";
import { cloneDeep } from "lodash";
import ICard from "@modules/cards/card.interface";
import { IResColumn } from "@modules/columns";
import { TeamWorkspaceSchema } from "@modules/teamWorkspace";
import UpdateBoardDto from "./dtos/updateBoardDto";
import AddMemsToBoardDto from "./dtos/addMemsToBoard";
import { StatusCodes } from "http-status-codes";
import { UserSchema } from "@modules/users";
import {
  NotificationSchema,
  NotificationService,
} from "@modules/notifications";
import PushNotificationDto from "@modules/notifications/dtos/pushNotificationDto";
export default class BoardService {
  private boardSchema = BoardSchema;
  private workspaceSchema = TeamWorkspaceSchema;
  private userSchema = UserSchema;
  private notificationSchema = NotificationSchema;
  private notificationService = new NotificationService();
  public async createBoard(
    model: CreateBoardDto,
    ownerId: string
  ): Promise<IBoard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const checkPermissionBoard = await permissionWorkspace(
      model.teamWorkspaceId,
      ownerId
    );
    if (!checkPermissionBoard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not permission to create board in this workspace"
      );
    }
    const existedBoard = await this.boardSchema
      .findOne({ title: model.title, teamWorkspaceId: model.teamWorkspaceId })
      .exec();
    if (existedBoard) {
      throw new HttpException(StatusCodes.CONFLICT, "Board already exists");
    }
    const createdBoard = await this.boardSchema.create({
      ...model,
      ownerIds: [{ user: ownerId, role: "boardLead" }],
    });
    if (!createdBoard) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not created");
    }
    return createdBoard;
  }
  public async addMemberToBoard(
    userId: string,
    boardId: string,
    memberIds: AddMemsToBoardDto
  ): Promise<IBoard> {
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not found");
    }
    const workspaceId = board.teamWorkspaceId;
    const workspace = this.workspaceSchema.findById(workspaceId).exec();
    if (!workspace) {
      throw new HttpException(StatusCodes.CONFLICT, "Workspace not found");
    }
    const checkPermissionBoard = await permissionBoard(boardId, userId);
    if (!checkPermissionBoard) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "You has not permission to add member to board"
      );
    }
    const members = memberIds.memberIds;
    const memberList = [...new Set([...board.memberIds, ...members])];
    board.memberIds = memberList;
    await board.save();
    //Send notification
    const senderId = await this.userSchema.findById(userId).exec();
    const sender = {
      id: senderId?._id,
      avatar: senderId?.avatar || null,
      name: `${senderId?.firstName} ${senderId?.lastName}`,
    };
    const message = `have added you to the board`;
    const model : PushNotificationDto[] =  members.map((memberId: string) => {
      return {
        sender: sender,
        type: MODEL_NAME.board,
        message,
        targetType: board?.title,
        contextUrl: '',
        receiverId: memberId,
      };
    })
    await this.notificationService.pushMultiNotification(model);
    return board;
  }
  public async getAllBoardByWorkspaceId(
    workspaceId: string,
    req: Request,
    userId: string
  ): Promise<IBoard[]> {
    if ((await viewWorkspacePermission(workspaceId, userId)) === false) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not permission to view this workspace"
      );
    }
    let nameBoard = "";
    if (!!req.query.search) {
      nameBoard = req.query.search.toString();
    }
    let boards: IBoard[] = [];
    if (nameBoard === "") {
      const feature = new APIFeatures(
        this.boardSchema.find({
          teamWorkspaceId: workspaceId,
        }),
        req.query
      )
        .filter()
        .sort()
        .limit()
        .paginate();
      boards = await feature.query;
    } else {
      const feature = new APIFeatures(
        this.boardSchema.find({
          teamWorkspaceId: workspaceId,
          $text: { $search: nameBoard },
        }),
        req.query
      )
        .filter()
        .sort()
        .limit()
        .paginate();
      boards = await feature.query;
    }

    return boards;
  }
  public async getBoardDetail(
    boardId: string,
    userId: string
  ): Promise<object> {
    if ((await viewedBoardPermission(boardId, userId)) === false) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You has not permission to get detail this board"
      );
    }
    const boardDetail = await this.boardSchema
      .aggregate([
        {
          $match: {
            _id: new OBJECT_ID(boardId),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "columns",
            localField: "_id",
            foreignField: "boardId",
            as: "columns",
          },
        },
        {
          $lookup: {
            from: "cards",
            localField: "_id",
            foreignField: "boardId",
            as: "cards",
            pipeline: [
              {
                $match: {
                  isActive: true,
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
                  boardId: { $first: "$boardId" },
                  cardId: { $first: "$cardId" },
                  columnId: { $first: "$columnId" },
                  title: { $first: "$title" },
                  cover: { $first: "$cover" },
                  startDate: { $first: "$startDate" },
                  dueDate: { $first: "$dueDate" },
                  label: { $first: "$label" },
                  priority: { $first: "$priority" },
                  isDone: { $first: "$isDone" },
                  isOverdue: { $first: "$isOverdue" },
                  memberIds: {
                    $push: {
                      $arrayElemAt: ["$members", 0],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  boardId: 1,
                  cardId: 1,
                  columnId: 1,
                  title: 1,
                  cover: 1,
                  startDate: 1,
                  dueDate: 1,
                  label: {
                    $arrayElemAt: ["$label", 0],
                  },
                  priority: 1,
                  isDone: 1,
                  isOverdue: 1,
                  memberIds: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            cover: 1,
            columnOrderIds: 1,
            type: 1,
            teamWorkspaceId: 1,
            cardId: 1,
            ownerIds: 1,
            memberIds: 1,
            createdAt: 1,
            dueDate: 1,
            columns: "$columns",
            cards: "$cards",
          },
        },
      ])
      .exec();
    // cloneDeep create new one without effecting original one
    const resBoard = cloneDeep(boardDetail[0] || {});
    resBoard.columns.forEach((column: IResColumn) => {
      column.cards = resBoard.cards.filter(
        (card: ICard) => card.columnId.toString() === column._id.toString()
      );
    });
    delete resBoard.cards;
    return resBoard;
  }
  public async getAllUserBoard(userId: string): Promise<object> {
    const workspaces = await this.workspaceSchema.find({
      $or: [
        { ownerIds: new OBJECT_ID(userId) },
        { memberIds: new OBJECT_ID(userId) },
      ],
      isActive: true,
    });

    if (!workspaces) {
      throw new HttpException(StatusCodes.CONFLICT, "Workspace not found");
    }
    const userBoards = await this.workspaceSchema.aggregate([
      {
        $match: {
          $or: [
            {
              workspaceAdmins: {
                $elemMatch: {
                  user: new OBJECT_ID(userId),
                },
              },
            },
            {
              workspaceMembers: {
                $elemMatch: {
                  user: new OBJECT_ID(userId),
                },
              },
            },
          ],
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "boards",
          localField: "_id",
          foreignField: "teamWorkspaceId",
          as: "boards",
          pipeline: [
            {
              $match: {
                isActive: true,
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                type: 1,
                teamWorkspaceId: 1,
                ownerIds: 1,
                memberIds: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          boards: 1,
          createdAt: 1,
        },
      },
    ]);
    return userBoards;
  }
  public async getMemberByBoardId(
    boardId: string,
    userId: string
  ): Promise<Object> {
    const isViewedBoard = await viewedBoardPermission(boardId, userId);
    if (isViewedBoard === false) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You has not permission to get detail this board"
      );
    }
    const members = await this.boardSchema
      .findById(boardId)
      .select("memberIds")
      .populate({
        path: "memberIds",
        select: "firstName lastName avatar email",
      })
      .exec();

    const oweners = await this.boardSchema
      .findById(boardId)
      .select("ownerIds.user ownerIds.role")
      .populate({
        path: "ownerIds.user",
        select: "firstName lastName avatar email",
      })
      .exec();

    return {
      boardId: boardId,
      oweners: oweners?.ownerIds,
      members: members?.memberIds,
    };
  }
  public async updateBoard(
    model: UpdateBoardDto,
    boardId: string,
    userId: string
  ): Promise<IBoard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existBoard = await this.boardSchema.findById(boardId).exec();
    if (!existBoard) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not found");
    }
    const checkPermissionBoard = await permissionBoard(boardId, userId);
    if (!checkPermissionBoard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not permission to update this board"
      );
    }
    const updatedBoard = await this.boardSchema
      .findByIdAndUpdate(
        boardId,
        {
          ...model,
          updatedAt: Date.now(),
        },
        { new: true }
      )
      .exec();
    if (!updatedBoard) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not updated");
    }
    updatedBoard.save();
    return updatedBoard;
  }
  public async grandBoardAdmin(
    userId: string,
    boardId: string,
    memberId: string
  ): Promise<void> {
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not found");
    }
    const checkSuperAdmin = await isSuperAdmin(board.teamWorkspaceId, userId);
    const checkBoardLead = await isBoardLead(boardId, userId);
    if (!checkBoardLead && !checkSuperAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not permission to grand admin permission"
      );
    }
    const checkBoardMember = await isBoardMember(boardId, memberId);
    if (!checkBoardMember) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "This member is not member of this board"
      );
    }
    board.ownerIds.push({
      user: memberId,
      role: ROLE.boardAdmin,
    });
    const memBoard = cloneDeep(board.memberIds);
    board.memberIds = memBoard.filter(
      (mem: any) => mem.toString() !== memberId
    );
    await board.save();
  }
  public async revokeBoardAdmin(
    userId: string,
    boardId: string,
    boardAdminId: string
  ): Promise<void> {
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not found");
    }
    const checkSuperAdmin = await isSuperAdmin(board.teamWorkspaceId, userId);
    const checkBoardLead = await isBoardLead(boardId, userId);
    if (!checkBoardLead && !checkSuperAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not permission to grand admin permission"
      );
    }
    const checkWorkspaceMem = await isWorkspaceMember(
      board.teamWorkspaceId,
      boardAdminId
    );
    if (!checkWorkspaceMem) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "This member is not member of this workspace"
      );
    }
    const checkBoardAdmin = await isBoardAdmin(boardId, boardAdminId);
    if (!checkBoardAdmin) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "This member is not admin of this board"
      );
    }
    const checkBoardMember = await isBoardMember(boardId, boardAdminId);
    if (!checkBoardMember) {
      board.ownerIds = board.ownerIds.filter(
        (admin: any) => admin.user.toString() !== boardAdminId
      );
      board.memberIds.push(boardAdminId);
      await board.save();
    }
  }
  public async uploadCoverBoard(
    userId: string,
    boardId: string,
    cover: string
  ): Promise<String> {
    const existBoard = await this.boardSchema.findById(boardId).exec();
    const checkPermissionBoard = await permissionBoard(boardId, userId);
    if (!existBoard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Worskapce not found");
    }
    if (!checkPermissionBoard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to upload cover workspace"
      );
    }
    existBoard.cover = cover;
    await existBoard.save();
    return existBoard.cover;
  }
}
