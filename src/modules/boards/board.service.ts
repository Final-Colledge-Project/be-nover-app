import { isEmptyObject } from '@core/utils';
import IBoard from './board.interface';
import BoardSchema from './board.model';
import CreateBoardDto from './dtos/createBoardDto';
import { HttpException } from '@core/exceptions';
import { isAdmin } from '@modules/teamWorkspace/utils';

export default class BoardService {
  public boardSchema = BoardSchema;
  public async createBoard(model: CreateBoardDto, ownerId: string, teamWorkspaceId: string): Promise<IBoard> {
    if(isEmptyObject(model)){
      throw new HttpException(400, "Model is empty");
    }
    const checkAdmin = await isAdmin(teamWorkspaceId, ownerId);
    if(!!checkAdmin === false){
      throw new HttpException(409, 'You has not permission to create board');
    }
    const existedBoard = await this.boardSchema.findOne({title: model.title, teamWorkspaceId: teamWorkspaceId}).exec();
    if(existedBoard){
      throw new HttpException(409, 'Board already exists');
    }
    const createdBoard = await this.boardSchema.create({
      ...model,
      ownerIds: [ownerId],
      teamWorkspaceId: teamWorkspaceId
    })
    if (!createdBoard){
      throw new HttpException(409, 'Board not created');
    }
    return createdBoard;
  }
  
}