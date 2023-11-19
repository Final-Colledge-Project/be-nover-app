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
export default class BoardService {
  private boardSchema = BoardSchema;
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
    if(nameBoard === ""){
      boards = await this.boardSchema
      .find({ teamWorkspaceId: workspaceId })
      .exec();
      return boards;
    }
    else{
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
  public async getAllUserBoard(userId: string): Promise<IBoard[]> {
    const boards = await this.boardSchema
      .find({ $or: [{ ownerIds: userId }, { memberIds: userId }] })
      .exec();

    const userBoards = await this.boardSchema.aggregate([
      {
        $match: {
          $or: [{ ownerIds: new OBJECT_ID(userId) }, {memberIds: new OBJECT_ID(userId)}],
          isActive: true
        },
      },
      {
        $group: {
          _id: '$teamWorkspaceId',
          board: {
            $push: {
              _id: '$_id',
              title: '$title',
              cover: '$cover',
              type:  '$type' ,
              teamWorkspaceId: '$teamWorkspaceId',
              ownerIds: '$ownerIds',
              memberIds: '$memberIds',
              createdAt: '$createdAt',
              dueDate: '$dueDate'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'teamworkspaces',
          localField: '_id',
          foreignField: '_id',
          as: 'teamWorkspace'
        }
      },
      {
        $project: {
          _id: 0,
          teamWorkspace: {
            $arrayElemAt: ['$teamWorkspace', 0]
          },
          board: 1
        }
      },
      {
        $project: {
          _id: '$teamWorkspace._id',
          name: '$teamWorkspace.name',
          board: 1
        }
      }
    ])
    return userBoards;


  }
}
