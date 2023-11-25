import {
  MODE_ACCESS,
  OBJECT_ID,
  isBoardMember,
  isEmptyObject,
  isWorkspaceAdmin,
  isWorkspaceMember,
} from "@core/utils";
import IBoard from "./board.interface";
import BoardSchema from "./board.model";
import CreateBoardDto from "./dtos/createBoardDto";
import { HttpException } from "@core/exceptions";
import mongoose, { Document, Model } from "mongoose";
import { Request } from "express";
import APIFeatures from "@core/utils/apiFeature";
import { cloneDeep } from "lodash";
import ICard from "@modules/cards/card.interface";
import { IResColumn } from "@modules/columns";
import { TeamWorkspaceSchema } from "@modules/teamWorkspace";
export default class BoardService {
  private boardSchema = BoardSchema;
  private workspaceSchema = TeamWorkspaceSchema;
  public async createBoard(
    model: CreateBoardDto,
    ownerId: string
  ): Promise<IBoard> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const checkAdmin = await isWorkspaceAdmin(model.teamWorkspaceId, ownerId);
    if (!!checkAdmin === false) {
      throw new HttpException(409, "You has not permission to create board");
    }
    const existedBoard = await this.boardSchema
      .findOne({ title: model.title, teamWorkspaceId: model.teamWorkspaceId })
      .exec();
    if (existedBoard) {
      throw new HttpException(409, "Board already exists");
    }
    const createdBoard = await this.boardSchema.create({
      ...model,
      ownerIds: [ownerId],
    });
    if (!createdBoard) {
      throw new HttpException(409, "Board not created");
    }
    return createdBoard;
  }
  public async addMemberToBoard(
    userId: string,
    boardId: string,
    memberId: string
  ): Promise<IBoard> {
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(409, "Board not found");
    }
    const workspaceId = board.teamWorkspaceId;
    const checkMember = await isWorkspaceMember(workspaceId, memberId);
    const checkAdmin = await isWorkspaceAdmin(workspaceId, userId);
    if (!!checkAdmin === false) {
      throw new HttpException(
        409,
        "You has not permission to add member to board"
      );
    }
    if (!!checkMember === false) {
      throw new HttpException(409, "Member not found");
    }
    const existedMember = board.memberIds.find(
      (id) => id.toString() === memberId
    );
    const existedAdmin = board.ownerIds.find(
      (id) => id.toString() === memberId
    );
    if (!!existedMember) {
      throw new HttpException(409, "Member already exists");
    }
    if (!!existedAdmin) {
      throw new HttpException(409, "Member is the admin");
    }
    board.memberIds.unshift(memberId);
    await board.save();
    return board;
  }
  public async pushColumnToBoard(columnId: string): Promise<Document<IBoard>> {
    const board = await this.boardSchema
      .findByIdAndUpdate(
        { _id: new OBJECT_ID(columnId) },
        { $push: { columnOrderIds: new OBJECT_ID(columnId) } },
        { returnDocument: "after" }
      )
      .exec();
    if (!board) {
      throw new HttpException(409, "Board not found");
    }
    return board;
  }
  public async getAllBoardByWorkspaceId(
    workspaceId: string,
    req: Request,
    userId: string
  ): Promise<IBoard[]> {
    const checkWorkspaceMember = await isWorkspaceMember(workspaceId, userId);
    if (!!checkWorkspaceMember === false) {
      throw new HttpException(
        409,
        "You has not permission to get all board on this workspace"
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
          teamWorkspaceId: workspaceId
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
    const existBoard = await this.boardSchema.findById(boardId).exec();
    if (!existBoard) {
      throw new HttpException(409, "Board not found");
    }
    const checkWorkspaceMember = await isWorkspaceMember(
      existBoard.teamWorkspaceId,
      userId
    );
    const checkBoardMember = await isBoardMember(boardId, userId);
    if (Boolean(checkWorkspaceMember) === false) {
      throw new HttpException(
        409,
        "You has not permission to get board detail"
      );
    }
    if (
      Boolean(checkBoardMember) === false &&
      existBoard.type === MODE_ACCESS.private
    ) {
      throw new HttpException(409, "Board is private");
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
                $unwind:{
                  path:  "$memberIds",
                  "preserveNullAndEmptyArrays": true
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
                  cardId: { $first: "$_id" },
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
                    }
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
                    $arrayElemAt: ["$label", 0]
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
      throw new HttpException(409, "Workspace not found");
    }

    const workspaceWithNoBoard = await this.workspaceSchema.aggregate([
      {
        $lookup: {
          from: "boards",
          localField: "_id",
          foreignField: "teamWorkspaceId",
          as: "boards",
        },
      },
      {
        $match: {
          $or: [
           { workspaceAdmins: {
              $elemMatch: {
                user: new OBJECT_ID(userId),
              },
            }},
           { 
            workspaceMembers: {
              $elemMatch: {
                user: new OBJECT_ID(userId),
              },
            }}
          ],
          isActive: true,
          boards: {$eq: []}
         }
        },
        {
          $project: {
            _id: 1,
            name: 1,
          }
        }
    ]);

    const userBoards = await this.boardSchema.aggregate([
      {
        $match: {
          $or: [
            { ownerIds: new OBJECT_ID(userId) },
            { memberIds: new OBJECT_ID(userId) },
          ],
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$teamWorkspaceId",
          board: {
            $push: {
              _id: "$_id",
              title: "$title",
              cover: "$cover",
              type: "$type",
              teamWorkspaceId: "$teamWorkspaceId",
              ownerIds: "$ownerIds",
              memberIds: "$memberIds",
              createdAt: "$createdAt",
              dueDate: "$dueDate",
            },
          },
        },
      },
      {
        $lookup: {
          from: "teamworkspaces",
          localField: "_id",
          foreignField: "_id",
          as: "teamWorkspace",
        },
      },
      {
        $project: {
          _id: 0,
          teamWorkspace: {
            $arrayElemAt: ["$teamWorkspace", 0],
          },
          board: 1,
        },
      },
      {
        $project: {
          _id: "$teamWorkspace._id",
          name: "$teamWorkspace.name",
          board: 1,
        },
      },
    ]);
    return {
      workspaceHasBoards: userBoards,
      workspaceWithNoBoard: workspaceWithNoBoard
    };
  }
  public async getMemberByBoardId(
    boardId: string,
    userId: string
  ): Promise<Object> {
    const checkBoardMember = await isBoardMember(boardId, userId);
    if (!!checkBoardMember === false) {
      throw new HttpException(
        409,
        "You has not permission to get member of this board"
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
}
