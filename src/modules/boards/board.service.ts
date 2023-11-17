import { MODE_ACCESS, OBJECT_ID, isBoardMember, isEmptyObject, isWorkspaceAdmin, isWorkspaceMember } from '@core/utils';
import {HttpException} from '@core/exceptions'
import mongoose, {Document, Model} from 'mongoose'
import {Request} from 'express'
import APIFeatures from '@core/utils/apiFeature'
import { cloneDeep } from 'lodash'
import { IColumn, IResColumn } from '@modules/columns'
import {ICard} from '@modules/cards'

import CreateBoardDto from './dtos/createBoardDto'
import BoardSchema from './board.model';
import IBoard from './board.interface'

export default class BoardService {
  private boardSchema = BoardSchema;
  public async createBoard(model: CreateBoardDto, ownerId: string): Promise<IBoard> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, 'Model is empty');
    }
    const checkAdmin = await isWorkspaceAdmin(model.teamWorkspaceId, ownerId);
    if (Boolean(checkAdmin) === false) {
      throw new HttpException(409, 'You has not permission to create board');
    }
    const existedBoard = await this.boardSchema
      .findOne({title: model.title, teamWorkspaceId: model.teamWorkspaceId})
      .exec();
    if (existedBoard) {
      throw new HttpException(409, 'Board already exists');
    }
    const createdBoard = await this.boardSchema.create({
      ...model,
      ownerIds: [ownerId]
    })
    if (!createdBoard) {
      throw new HttpException(409, 'Board not created');
    }
    return createdBoard;
  }

  public async addMemberToBoard(userId: string, boardId: string, memberId: string): Promise<IBoard> {
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(409, 'Board not found');
    }
    const workspaceId = board.teamWorkspaceId;
    const checkMember = await isWorkspaceMember(workspaceId, memberId);
    const checkAdmin = await isWorkspaceAdmin(workspaceId, userId);
    if (Boolean(checkAdmin) === false) {
      throw new HttpException(409, 'You has not permission to add member to board');
    }
    if (Boolean(checkMember) === false) {
      throw new HttpException(409, 'Member not found');
    }
    const existedMember = board.memberIds.find((id) => id.toString() === memberId);
    const existedAdmin = board.ownerIds.find((id) => id.toString() === memberId);
    if (existedMember) {
      throw new HttpException(409, 'Member already exists');
    }
    if (existedAdmin) {
      throw new HttpException(409, 'Member is the admin');
    }
    board.memberIds.unshift(memberId);
    await board.save();
    return board;
  }

  public async pushColumnToBoard(columnId: string): Promise<Document<IBoard>> {
    const board = await this.boardSchema
      .findByIdAndUpdate(
        {_id: new OBJECT_ID(columnId)},
        {$push: {columnOrderIds: new OBJECT_ID(columnId)}},
        {returnDocument: 'after'}
      )
      .exec();
    if (!board) {
      throw new HttpException(409, 'Board not found');
    }
    return board
  }

  public async getAllBoardByWorkspaceId(workspaceId: string, req: Request, userId: string): Promise<IBoard[]> {
    const checkWorkspaceMember = await isWorkspaceMember(workspaceId, userId);
    if (Boolean(checkWorkspaceMember) === false) {
      throw new HttpException(409, 'You has not permission to get all board on this workspace');
    }
    let nameBoard = ''
    if (req.query.search) {
      nameBoard = req.query.search.toString();
    }
    const feature = new APIFeatures(
      this.boardSchema.find({teamWorkspaceId: workspaceId, $text: {$search: nameBoard}}),
      req.query,
    )
      .filter()
      .sort()
      .limit()
      .paginate();
    const boards = await feature.query;
    return boards;
  }

  public async getBoardDetail(boardId: string, userId: string): Promise<object> {
    const existBoard = await this.boardSchema.findById(boardId).exec();
    if (!existBoard) {
      throw new HttpException(409, 'Board not found');
    }
    const checkWorkspaceMember = await isWorkspaceMember(existBoard.teamWorkspaceId, userId);
    const checkBoardMember = await isBoardMember(boardId, userId);
    if (Boolean(checkWorkspaceMember) === false) {
      throw new HttpException(409, 'You has not permission to get board detail');
    }
    if (Boolean(checkBoardMember) === false && existBoard.type === MODE_ACCESS.private) {
      throw new HttpException(409, 'Board is private');
    }

    const boardDetail = await this.boardSchema
      .aggregate([
        {
          $match: {
            _id: new OBJECT_ID(boardId),
            isActive: true
          },
        },
        {
          $lookup: {
            from: 'columns',
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          },
        },
        {
          $lookup: {
            from: 'cards',
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          },
        },
      ])
      .exec();
    // cloneDeep create new one without effecting original one
    const resBoard = cloneDeep(boardDetail[0] || {});
    resBoard.columns.forEach((column: IResColumn) => {
      column.cards = resBoard.cards.filter((card: ICard) => card.columnId.toString() === column._id.toString())
    })
    delete resBoard.cards;
    return resBoard;
  }
}
