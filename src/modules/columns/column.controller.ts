import { NextFunction, Request, Response } from "express";
import { catchAsync } from "@core/utils";
import ColumnService from "./column.service";
import CreateColumnDto from "./dtos/createColumnDto";
import { StatusCodes } from "http-status-codes";

export default class ColumnController {
  private columnService = new ColumnService();
  public createColumn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const model : CreateColumnDto = req.body;
    const newColumn = await this.columnService.createColumn(model, userId);
    res.status(StatusCodes.CREATED).json({data: newColumn, message: "Create column successfully" });
  })
  public getColumnById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const columnId = req.params.id;
    const column = await this.columnService.getColumnById(columnId);
    res.status(StatusCodes.OK).json({ data: column });
  })
  public getColumnByBoardId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const boardId = req.params.id;
    const userId = req.user.id;
    const columns = await this.columnService.getColumnsByBoardId(boardId, userId);
    res.status(StatusCodes.OK).json({ data: columns, message: "Get columns successfully" });
  })
}