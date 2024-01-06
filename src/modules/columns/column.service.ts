import {
  OBJECT_ID,
  isBoardAdmin,
  isBoardLead,
  isBoardMember,
  isEmptyObject,
  permissionColumn,
  viewedBoardPermission,
} from "@core/utils";
import ColumnSchema from "./column.model";
import CreateColumnDto from "./dtos/createColumnDto";
import { HttpException } from "@core/exceptions";
import { BoardSchema } from "@modules/boards";
import IColumn from "./column.interface";
import { StatusCodes } from "http-status-codes";
import UpdateColumnDto from "./dtos/updateColumnDtos";
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
    const checkPermissionCol = await permissionColumn(board.id, userId);
    if (!checkPermissionCol) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to create column"
      );
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
    if ((await viewedBoardPermission(boardId, userId)) === false) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not member of this board"
      );
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
  public async updateColumn(
    model: UpdateColumnDto,
    columnId: string,
    userId: string
  ): Promise<IColumn> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existColumn = await this.columnSchema.findById(columnId).exec();
    if (!existColumn) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not found");
    }
    if (!model.cardOrderIds) {
      const checkPermissionCol = await permissionColumn(
        existColumn.boardId,
        userId
      );
      if (!checkPermissionCol) {
        throw new HttpException(
          StatusCodes.FORBIDDEN,
          "You have not permission to update column"
        );
      }
    }

    if (model.title) {
      const existTitle = await this.columnSchema
        .findOne({ title: model.title, boardId: existColumn.boardId })
        .exec();
      if (existTitle) {
        throw new HttpException(
          StatusCodes.CONFLICT,
          `Column with title ${model.title} already exists`
        );
      }
    }
    const updatedColumn = await this.columnSchema
      .findByIdAndUpdate(
        columnId,
        {
          ...model,
          updatedAt: Date.now(),
        },
        { new: true }
      )
      .exec();
    if (!updatedColumn) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not updated");
    }
    return updatedColumn;
  }
  public async deleteColumn(
    columnId: string,
    userId: string
  ): Promise<IColumn> {
    const column = await this.columnSchema.findById(columnId).exec();
    if (!column) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not found");
    }
    const checkPermissionCol = await permissionColumn(column.boardId, userId);
    if (!checkPermissionCol) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to delete column"
      );
    }
    if (column.cardOrderIds.length > 0) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not empty");
    }
    const deletedColumn = await this.columnSchema
      .findByIdAndDelete(columnId)
      .exec();
    if (!deletedColumn) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not deleted");
    }
    await BoardSchema.findByIdAndUpdate(
      { _id: new OBJECT_ID(deletedColumn.boardId) },
      { $pull: { columnOrderIds: deletedColumn._id } },
      { new: true }
    ).exec();
    return deletedColumn;
  }
}
