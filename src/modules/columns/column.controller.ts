import { NextFunction, Request, Response } from "express";
import { catchAsync } from "@core/utils";
import ColumnService from "./column.service";
import CreateColumnDto from "./dtos/createColumnDto";

export default class ColumnController {
  private columnService = new ColumnService();
  public createColumn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const model : CreateColumnDto = req.body;
    await this.columnService.createColumn(model, userId);
    res.status(201).json({ message: "Create column successfully" });
  })

}