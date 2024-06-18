import TaskLogSchema from "./taskLog.model";
import ITaskLog from "./taskLog.interface";
import { MODEL_NAME, isBoardMember } from "@core/utils";
import { StatusCodes } from "http-status-codes";
import { HttpException } from "@core/exceptions";

export default class TaskLogService {
  private taskLogSchema = TaskLogSchema;
  public async getTaskLogs(
    issueModel: string,
    issueId: string,
    userId: string,
    boardId: string
  ): Promise<ITaskLog[]> {
    const boardMember = await isBoardMember(boardId, userId);
    if (!boardMember) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Permission denied");
    }
    const taskLogs = await this.taskLogSchema
      .find({
        issueModel,
        issueId,
      })
      .exec();
    return taskLogs;
  }
}
