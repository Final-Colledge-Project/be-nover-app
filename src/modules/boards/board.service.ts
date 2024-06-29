import {
  MODEL_NAME,
  OBJECT_ID,
  ROLE,
  isBoardAdmin,
  isBoardMember,
  isEmptyObject,
  isSuperAdmin,
  isWorkspaceMember,
  permissionBoard,
  viewedBoardPermission,
} from "@core/utils";
import IBoard from "./board.interface";
import BoardSchema from "./board.model";
import CreateBoardDto from "./dtos/createBoardDto";
import { HttpException } from "@core/exceptions";
import { Request } from "express";
import APIFeatures from "@core/utils/apiFeature";
import { cloneDeep, create } from "lodash";
import ICard from "@modules/cards/card.interface";
import { IResColumn } from "@modules/columns";
import { TeamWorkspaceSchema } from "@modules/teamWorkspace";
import UpdateBoardDto from "./dtos/updateBoardDto";
import AddMemsToBoardDto, { IAddMem } from "./dtos/addMemsToBoard";
import { StatusCodes } from "http-status-codes";
import { NotificationService } from "@modules/notifications";
import PushNotificationDto from "@modules/notifications/dtos/pushNotificationDto";
import { CardSchema } from "@modules/cards";
import { SubCardSchema } from "@modules/sub_cards";
import { LabelSchema } from "@modules/labels";
import { BoardPermissionSchema } from "@modules/boardPermission";
import { UserSchema } from "@modules/users";
import mongoose, { ClientSession } from "mongoose";
import { WorkspacePermissionSchema } from "@modules/workspacePermission";
export default class BoardService {
  private boardSchema = BoardSchema;
  private workspaceSchema = TeamWorkspaceSchema;
  private boardPermissionSchema = BoardPermissionSchema;
  private wsPermissionSchema = WorkspacePermissionSchema;
  private userSchema = UserSchema;
  private notificationService = new NotificationService();
  public async createBoard(
    model: CreateBoardDto,
    ownerId: string,
    wsId: string,
    session: any
  ): Promise<IBoard> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existedBoard = await this.boardSchema
      .findOne({
        title: model.title,
        teamWorkspaceId: wsId,
        isActive: true,
      })
      .exec();
    if (existedBoard) {
      throw new HttpException(StatusCodes.CONFLICT, "Board already exists");
    }
    const createdBoard = await this.boardSchema.create(
      [
        {
          ...model,
          teamWorkspaceId: wsId,
          ownerIds: [ownerId],
        },
      ],
      { session }
    );

    if (!createdBoard) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not created");
    }
    const workspace = await this.workspaceSchema.findById(wsId).exec();
    if (!workspace) {
      throw new HttpException(StatusCodes.CONFLICT, "Workspace not found");
    }
    const superAdmin = workspace.workspaceAdmins.find(
      (mem) => mem.role === ROLE.superAdmin
    );
    await this.boardPermissionSchema.create(
      [
        {
          name: "Admin",
          description: "This permission can manage all board",
          boardId: createdBoard[0]._id,
          memberIds: [superAdmin?.user, ownerId],
          column: {
            create: true,
            update: true,
            delete: true,
          },
          member: {
            invite: true,
          },
          issueType: {
            create: true,
            update: true,
            delete: true,
          },
          priority: {
            create: true,
            update: true,
            delete: true,
          },
          label: {
            create: true,
            update: true,
            delete: true,
          },
          isAdmin: true,
        },
        {
          name: "Viewer",
          description:
            "This permission can modify cards, and view other information on project",
          boardId: createdBoard[0]._id,
          isViewer: true,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return createdBoard[0];
  }
  public async addMemberToBoard(
    userId: string,
    boardId: string,
    inviteMems: AddMemsToBoardDto,
    session: ClientSession
  ): Promise<IBoard> {
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    const workspaceId = board.teamWorkspaceId;
    const workspace = await this.workspaceSchema.findById(workspaceId).exec();
    if (!workspace) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Workspace not found");
    }
    //Add members to board
    const members = (inviteMems.members || []).map((mem: IAddMem) => mem.memberId);
    if (members.length !== [...new Set(members)].length) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Duplicate member");
    }
    const objectIdArray = members.map((id) => new mongoose.Types.ObjectId(id));
    const users = await this.userSchema.find({
      _id: {
        $in: objectIdArray,
      },
    });
    if (members.length !== users.length || !users) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "User not found");
    }
    const isExistWSMember = workspace.workspaceMembers.some((mem) => {
      return members.includes(mem.user.toString());
    });
    if (!isExistWSMember) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "User is not member of workspace"
      );
    }
    const isExistMember = board.memberIds.some((mem) => {
      return members.includes(mem.toString());
    });
    if (isExistMember) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "User already in board");
    }
    const memberList = [...new Set([...board.memberIds, ...members])];
    board.memberIds = memberList;
    await board.save({ session });
    //Add permission for members
    const permissions = inviteMems.members.map(
      (mem: IAddMem) => mem.permissionId
    );
    if (permissions.length !== inviteMems.members.length) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Lack of permission");
    }
    const permissionArray = [...new Set(permissions)].map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const boardPerms = await this.boardPermissionSchema.find({
      _id: {
        $in: permissionArray,
      },
    });
    if (permissionArray.length !== boardPerms.length) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Permission not found");
    }
    const isAdminPerm = await this.boardPermissionSchema
      .findOne({
        boardId: boardId,
        isAdmin: true,
        memberIds: {
          $in: [userId],
        },
      })
      .exec();
    if (isAdminPerm) {
      const groupMemByPerm: { [key: string]: string[] } =
        inviteMems.members.reduce<{ [key: string]: string[] }>((acc, mem) => {
          acc[mem.permissionId] = acc[mem.permissionId] || [];
          acc[mem.permissionId].push(mem.memberId);
          return acc;
        }, {});
      const permPromise =( Object.keys(groupMemByPerm) || []).map(async (permId) => {
        const perm = boardPerms.find((perm) => perm._id.toString() === permId);
        if (!perm) {
          throw new HttpException(
            StatusCodes.BAD_REQUEST,
            "Permission not found"
          );
        }
        perm.memberIds = [
          ...new Set([...perm.memberIds, ...groupMemByPerm[permId]]),
        ];
        await perm.save({ session });
      });
      await Promise.all(permPromise);
    } else {
      const viewerPerm = await this.boardPermissionSchema
        .findOne({
          boardId: boardId,
          isViewer: true,
        })
        .exec();
      if (!viewerPerm) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Viewer permission not found"
        );
      }
      viewerPerm.memberIds = [
        ...new Set([...viewerPerm.memberIds, ...members]),
      ];
      await viewerPerm.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    //Send notification
    const message = `have added you to the board`;
    const model: PushNotificationDto[] = members.map((memberId: string) => {
      return {
        senderId: userId,
        targetType: board.title,
        message,
        type: {
          category: MODEL_NAME.board,
          name: board.title,
        },
        contextUrl: `${process.env.URL_CLIENT}/u/boards/${boardId}`,
        receiverId: memberId,
      };
    });
    await this.notificationService.pushMultiNotification(model);
    return board;
  }
  public async getAllBoardByWorkspaceId(
    workspaceId: string,
    req: Request,
    userId: string
  ): Promise<IBoard[]> {
    const permGroup = await this.wsPermissionSchema
      .findOne({
        memberIds: userId,
        workspaceId: workspaceId,
      })
      .exec();
    const isViewAll = permGroup?.board?.viewAll;
    let nameBoard = "";
    if (!!req.query.search) {
      nameBoard = req.query.search.toString();
    }
    let boards: IBoard[] = [];
    const getExtendCondition = () => {
      let result = {};
      if (!isViewAll) {
        result = {
          $or: [
            {
              memberIds: { $in: [userId] },
            },
            {
              ownerIds: { $in: [userId] },
            },
          ],
        };
      }
      if (nameBoard) {
        result = {
          ...result,
          $text: { $search: nameBoard },
        };
      }
      return result;
    };
    const feature = new APIFeatures(
      this.boardSchema.find({
        teamWorkspaceId: workspaceId,
        ...getExtendCondition(),
      }),
      req.query
    )
      .filter()
      .sort()
      .limit()
      .paginate();
    boards = await feature.query;
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
      .select("ownerIds")
      .populate({
        path: "ownerIds",
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
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission Denied");
    }
    const updatedBoard = await this.boardSchema
      .findByIdAndUpdate(
        boardId,
        {
          ...model,
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
    if (!checkSuperAdmin) {
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
    board.ownerIds.push(memberId);
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

    if (!checkSuperAdmin) {
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
  public async deleteMemberFromBoard(
    userId: string,
    boardId: string,
    memberId: string
  ): Promise<void> {
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not found");
    }
    const checkPermissionBoard = await permissionBoard(boardId, userId);
    if (!checkPermissionBoard) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to delete member from board"
      );
    }
    const checkBoardMember = await isBoardMember(boardId, memberId);
    if (!checkBoardMember) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "This member is not member of this board"
      );
    }
    board.memberIds = board.memberIds.filter(
      (mem: any) => mem.toString() !== memberId
    );
    await board.save();
    const assignedCard = await CardSchema.find({
      boardId: boardId,
      memberIds: memberId,
    }).exec();
    if (assignedCard.length > 0) {
      for (const card of assignedCard) {
        card.memberIds = card.memberIds.filter(
          (mem: any) => mem.toString() !== memberId
        );
        await card.save();
      }
    }
    const assignedSubCard = await SubCardSchema.find({
      boardId: boardId,
      assignedTo: memberId,
    }).exec();
    if (assignedSubCard.length > 0) {
      for (const card of assignedSubCard) {
        card.assignedTo = null;
        await card.save();
      }
    }
  }
  public async deleteBoard(boardId: string, userId: string): Promise<void> {
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not found");
    }
    const checkSuperAdmin = await isSuperAdmin(board.teamWorkspaceId, userId);
    if (!checkSuperAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not permission to delete this board"
      );
    }
    board.isActive = false;
    await board.save();
    const filter = {
      boardId: boardId,
      isActive: true,
    };
    const updateOperation = {
      $set: {
        isActive: false,
      },
    };
    await CardSchema.updateMany(filter, updateOperation).exec();
    await LabelSchema.updateMany(filter, updateOperation).exec();
  }
}
