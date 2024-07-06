import { catchAsync } from "@core/utils";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import WorkspacePermissionService from "./wsPermission.service";
import AddWSPermissionDto from "./dtos/addWSPermissionDto";
import UpdateWSPermissionDto from "./dtos/updateWSPermissionDto";
import { startSession } from "mongoose";
export default class WorkspacePermissionController {
  private wsPermissionService = new WorkspacePermissionService();
  public createWSPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const wsId = req.params.id;
      const model: AddWSPermissionDto = req.body;
      await session.startTransaction();
      await this.wsPermissionService.createWorkspacePermission(
        userId,
        wsId,
        model,
        session
      );
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Create group permission successfully" });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };

  public updateWSPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const permissionId = req.params.id;
      const model: UpdateWSPermissionDto = req.body;
      await session.startTransaction();
      await this.wsPermissionService.updateWSPermission(
        userId,
        permissionId,
        model,
        session
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Update group permission successfully" });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
  public getWSPermissionByWSdId = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const wsId = req.params.id;
      const groupPermission =
        await this.wsPermissionService.getWSPermissionByWSId(userId, wsId);
      res.status(StatusCodes.OK).json({
        data: groupPermission,
        message: "Get group permission successfully",
      });
    }
  );
  public getWSPermissionByUser = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const wsId = req.params.id;
      const groupPermission =
        await this.wsPermissionService.getWSPermissionByUser(userId, wsId);
      res.status(StatusCodes.OK).json({
        data: groupPermission,
        message: "Get group permission successfully",
      });
    }
  );
  public deleteWSPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const permissionId = req.params.id;
      const workspaceId = req.params.wsId;
      session.startTransaction();
      await this.wsPermissionService.deleteWSPermission(
        userId,
        workspaceId,
        permissionId,
        session
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Delete group permission successfully" });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
}
