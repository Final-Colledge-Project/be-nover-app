import { catchAsync } from "@core/utils";
import TaskLogService from "./taskLog.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
export default class TaskLogController {
  private taskLogService = new TaskLogService();
  public getTaskLogs = catchAsync(async (req: Request, res: Response) => {
    const { model, id } = req.query;
    const boardId = req.params.boardId;
    const userId = req.user.id;
    const taskLogs = await this.taskLogService.getTaskLogs(
      model as string,
      id as string,
      userId as string,
      boardId as string
    );
    res.status(StatusCodes.OK).json({
      data: taskLogs,
      message: "Get tasklog successfully",
    });
  });
}
