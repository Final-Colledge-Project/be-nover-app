import { catchAsync } from "@core/utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import WorkspacePermissionService from "./wsPermission.service";
import AddWSPermissionDto from "./dtos/addWSPermissionDto";
import UpdateWSPermissionDto from "./dtos/updateWSPermissionDto";
export default class WorkspacePermissionController {
  private boardPermissionService = new WorkspacePermissionService();
  public createWSPermission = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const wsId = req.params.id;
      const model: AddWSPermissionDto = req.body;
      await this.boardPermissionService.createWorkspacePermission(
        userId,
        wsId,
        model
      );
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Create group permission successfully" });
    }
  );
  public updateWSPermission = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const permissionId = req.params.id;
      const model: UpdateWSPermissionDto = req.body;
      await this.boardPermissionService.updateWSPermission(
        userId,
        permissionId,
        model
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Update group permission successfully" });
    }
  );
  public getWSPermissionByWSdId = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const wsId = req.params.id;
      const groupPermission =
        await this.boardPermissionService.getWSPermissionByWSId(userId, wsId);
      res.status(StatusCodes.OK).json({
        data: groupPermission,
        message: "Get group permission successfully",
      });
    }
  );
  public getWSPermissionByUser = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const boardId = req.params.id;
      const groupPermission =
        await this.boardPermissionService.getWSPermissionByBoardUser(
          userId,
          boardId
        );
      res.status(StatusCodes.OK).json({
        data: groupPermission,
        message: "Get group permission successfully",
      });
    }
  );
}
