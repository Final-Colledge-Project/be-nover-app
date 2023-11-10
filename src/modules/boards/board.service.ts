import { OBJECT_ID, isEmptyObject, isWorkspaceAdmin, isWorkspaceMember } from '@core/utils';
import IBoard from './board.interface';
import BoardSchema from './board.model';
import CreateBoardDto from './dtos/createBoardDto';
import { HttpException } from '@core/exceptions';
import mongoose, { Document, Model } from 'mongoose';
export default class BoardService {
  private boardSchema = BoardSchema;
  public async createBoard(model: CreateBoardDto, ownerId: string): Promise<IBoard> {
    if(isEmptyObject(model)){
      throw new HttpException(400, "Model is empty");
    }
    const checkAdmin = await isWorkspaceAdmin(model.teamWorkspaceId, ownerId);
    if(!!checkAdmin === false){
      throw new HttpException(409, 'You has not permission to create board');
    }
    const existedBoard = await this.boardSchema.findOne({title: model.title, teamWorkspaceId: model.teamWorkspaceId}).exec();
    if(existedBoard){
      throw new HttpException(409, 'Board already exists');
    }
    const createdBoard = await this.boardSchema.create({
      ...model,
      ownerIds: [ownerId]
    })
    if (!createdBoard){
      throw new HttpException(409, 'Board not created');
    }
    return createdBoard;
  }
  public async addMemberToBoard(userId: string, boardId: string, memberId: string): Promise<IBoard> {
    const board = await this.boardSchema.findById(boardId).exec();
    if(!board){
      throw new HttpException(409, 'Board not found');
    }
    const workspaceId = board.teamWorkspaceId;
    const checkMember = await isWorkspaceMember(workspaceId, memberId);
    const checkAdmin = await isWorkspaceAdmin(workspaceId, userId);
    if (!!checkAdmin === false){
      throw new HttpException(409, 'You has not permission to add member to board');
    }
    if(!!checkMember === false){
      throw new HttpException(409, 'Member not found');
    }
    const existedMember = board.memberIds.find((id) => id.toString() === memberId);
    const existedAdmin = board.ownerIds.find((id) => id.toString() === memberId);
    if(!!existedMember){
      throw new HttpException(409, 'Member already exists');
    }
    if(!!existedAdmin){
      throw new HttpException(409, 'Member is the admin');
    }
    board.memberIds.unshift(memberId);
    await board.save();
    return board;
  }
  public async pushColumnToBoard(columnId: string): Promise<Document<IBoard>> {
    const board =  await this.boardSchema.findByIdAndUpdate(
    {_id: new OBJECT_ID(columnId)}, 
    {$push: {columnOrderIds: new OBJECT_ID(columnId)}},
    {returnDocument: 'after'}).exec();  
    if(!board) {
      throw new HttpException(409, 'Board not found');
    }
    return board
  }
}