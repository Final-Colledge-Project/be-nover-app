import { isBoardAdmin, isEmptyObject } from '@core/utils';
import ColumnSchema from './column.model';
import CreateColumnDto from './dtos/createColumnDto';
import { HttpException } from '@core/exceptions';
import { BoardSchema } from '@modules/boards';

export default class ColumnService {
  private columnSchema = ColumnSchema;
  public async createColumn(model: CreateColumnDto, userId: string, boardId: string): Promise<void> {
    console.log("model", model);
    if(isEmptyObject(model)){
      throw new HttpException(400, "Model is empty");
    }
    const board = await BoardSchema.findById(boardId).exec();
    if(!board){
      throw new HttpException(409, 'Board not found');
    }
    if(await !isBoardAdmin(boardId, userId)){
      throw new HttpException(403, 'You are not admin of this board');
    }
    const existColumn = await this.columnSchema.findOne({
      title: model.title,
      boardId: boardId
    })
    if (existColumn) {
      throw new HttpException(409, `Column with title ${model.title} already exists`);
    }
    await this.columnSchema.create({
      ...model,
      boardId});
  }
}