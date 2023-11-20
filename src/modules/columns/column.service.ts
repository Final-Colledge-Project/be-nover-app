import { OBJECT_ID, isBoardAdmin, isEmptyObject } from '@core/utils';
import ColumnSchema from './column.model';
import CreateColumnDto from './dtos/createColumnDto';
import { HttpException } from '@core/exceptions';
import { BoardSchema } from '@modules/boards';
import IColumn from './column.interface';

export default class ColumnService {
  private columnSchema = ColumnSchema;
  public async createColumn(model: CreateColumnDto, userId: string): Promise<void> {
    if(isEmptyObject(model)){
      throw new HttpException(400, "Model is empty");
    }
    const board = await BoardSchema.findById(model.boardId).exec();
    if(!board){
      throw new HttpException(409, 'Board not found');
    }
    if(await !isBoardAdmin(model.boardId, userId)){
      throw new HttpException(403, 'You are not admin of this board');
    }
    const existColumn = await this.columnSchema.findOne({
      title: model.title,
      boardId: model.boardId
    })

    if (existColumn) {
      throw new HttpException(409, `Column with title ${model.title} already exists`);
    }
    const newColumn = await this.columnSchema.create({...model}); 
    if (!newColumn){
      throw new HttpException(409, 'Column not created');
    }
    await BoardSchema.findByIdAndUpdate(
      {_id: new OBJECT_ID(newColumn.boardId)}, 
      {$push: {columnOrderIds: newColumn._id}},
      {new: true}).exec();  
  }
  public async getColumnById(columnId: string): Promise<IColumn> {
    const column = await this.columnSchema.findById(columnId).exec();
    if(!column){
      throw new HttpException(409, 'Column not found');
    }
    return column;
  }
}