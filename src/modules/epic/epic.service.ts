import {
  OBJECT_ID,
  isBoardAdmin,
  isBoardMember,
  isEmptyObject,
  permissionColumn,
  viewedBoardPermission,
} from "@core/utils";

import { HttpException } from "@core/exceptions";
import { BoardSchema } from "@modules/boards";

import { StatusCodes } from "http-status-codes";
import { EpicSchema } from ".";
import CreateEpicDto from "./dtos/createEpicDto";
import IEpic from "./epic.interface";

export default class ColumnService {
  private epicSchema = EpicSchema;
  private boardSchema = BoardSchema;
  public async createEpic(
    model: CreateEpicDto,
    boardId: string,
    session: 
  ): Promise<IEpic> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const board = await this.boardSchema.findById(boardId).exec();
    if (!board) {
      throw new HttpException(StatusCodes.CONFLICT, "Board not found");
    }
    const existEpic = await this.epicSchema.findOne({
      title: model.name,
      boardId,
    });

    if (existEpic) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        `Column with title ${model.name} already exists`
      );
    }
    const newEpic = await this.epicSchema.create({
      ...model,
      boardId,
    });
    if (!newEpic) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not created");
    }
    await EpicSchema.findByIdAndUpdate(
      { _id: new OBJECT_ID(newEpic.boardId) },
      { $push: { columnOrderIds: newEpic._id } },
      { new: true }
    ).exec();
    return newEpic;
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
    columnId: string
  ): Promise<IColumn> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existColumn = await this.columnSchema.findById(columnId).exec();
    if (!existColumn) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not found");
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
        },
        { new: true }
      )
      .exec();
    if (!updatedColumn) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not updated");
    }
    return updatedColumn;
  }
  public async deleteColumn(columnId: string): Promise<IColumn> {
    const column = await this.columnSchema.findById(columnId).exec();
    if (!column) {
      throw new HttpException(StatusCodes.CONFLICT, "Column not found");
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
