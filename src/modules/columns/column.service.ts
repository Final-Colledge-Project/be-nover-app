import {
  OBJECT_ID,
  isBoardAdmin,
  isBoardMember,
  isEmptyObject,
} from "@core/utils";
import ColumnSchema from "./column.model";
import CreateColumnDto from "./dtos/createColumnDto";
import { HttpException } from "@core/exceptions";
import { BoardSchema } from "@modules/boards";
import IColumn from "./column.interface";
import { StatusCodes } from "http-status-codes";
export default class ColumnService {
  private columnSchema = ColumnSchema;
  private boardSchema = BoardSchema;
  public async createColumn(
    model: CreateColumnDto,
    userId: string
  ): Promise<IColumn> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const board = await this.boardSchema.findById(model.boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not found");
    }
    if (await !isBoardAdmin(model.boardId, userId)) {
      throw new HttpException(StatusCodes.FORBIDDEN, "You are not admin of this board");
    }
    const existColumn = await this.columnSchema.findOne({
      title: model.title,
      boardId: model.boardId,
    });

    if (existColumn) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        `Column with title ${model.title} already exists`
      );
    }
    const newColumn = await this.columnSchema.create({ ...model });
    if (!newColumn) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not created");
    }
    await BoardSchema.findByIdAndUpdate(
      { _id: new OBJECT_ID(newColumn.boardId) },
      { $push: { columnOrderIds: newColumn._id } },
      { new: true }
    ).exec();
    return newColumn;
  }
  public async getColumnById(columnId: string): Promise<IColumn> {
    const column = await this.columnSchema.findById(columnId).exec();
    if (!column) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not found");
    }
    return column;
  }
  public async getColumnsByBoardId(
    boardId: string,
    userId: string
  ): Promise<IColumn[]> {
    const checkMember = await isBoardMember(boardId, userId);
    if (!checkMember) {
      throw new HttpException(StatusCodes.FORBIDDEN, "You are not member of this board");
    }
    const columns = await this.columnSchema
      .find({ boardId })
      .select("-__v")
      .exec();
    if (!columns) {
      throw new HttpException(StatusCodes.CONFLICT, "Columns not found");
    }
    return columns;
  }
}
