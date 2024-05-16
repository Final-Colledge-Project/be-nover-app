import { catchAsync } from "@core/utils";
import PermissionGroupService from "./permissionGroup.service";
import { Request, Response } from "express";
import AddPermissionGroupDto from "./dtos/addPermissionGroupDto";
import { StatusCodes } from "http-status-codes";
export default class PermissionGroupController {
  private permissionGroupService = new PermissionGroupService();
  public createGroupPermission = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const boardId = req.params.id;
      const model: AddPermissionGroupDto = req.body;
      await this.permissionGroupService.createGroupPermission(
        userId,
        boardId,
        model
      );
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Create group permission successfully" });
    }
  );
  public updateGroupPermission = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const permissionId = req.params.id;
      const model: AddPermissionGroupDto = req.body;
      await this.permissionGroupService.updateGroupPermission(
        userId,
        permissionId,
        model
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Update group permission successfully" });
    }
  );
  public getGroupPermissionByBoardId = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const boardId = req.params.id;
      const groupPermission =
        await this.permissionGroupService.getGroupPermissionByBoardId(
          userId,
          boardId
        );
      res.status(StatusCodes.OK).json({
        data: groupPermission,
        message: "Get group permission successfully",
      });
    }
  );
  public getGroupPermissionByBoardUser = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const boardId = req.params.id;
      const groupPermission =
        await this.permissionGroupService.getGroupPermissionByBoardUser(
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
