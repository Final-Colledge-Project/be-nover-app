import { catchAsync } from "@core/utils";
import BoardPermissionService from "./boardPermission.service";
import { NextFunction, Request, Response } from "express";
import AddBoardPermissionDto from "./dtos/addBoardPermissionDto";
import UpdateBoardPermissionDto from "./dtos/updateBoardPermissionDto";
import { StatusCodes } from "http-status-codes";
import { startSession } from "mongoose";
export default class BoardPermissionController {
  private boardPermissionService = new BoardPermissionService();
  public createBoardPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const boardId = req.params.id;
      const model: AddBoardPermissionDto = req.body;
      session.startTransaction();
      await this.boardPermissionService.createBoardPermission(
        userId,
        boardId,
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
  public updateBoardPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const permissionId = req.params.id;
      const model: UpdateBoardPermissionDto = req.body;
      session.startTransaction();
      await this.boardPermissionService.updateBoardPermission(
        userId,
        permissionId,
        model,
        session
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Update group permission successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  public getBoardPermissionByBoardId = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const boardId = req.params.id;
      const groupPermission =
        await this.boardPermissionService.getBoardPermissionByBoardId(
          userId,
          boardId
        );
      res.status(StatusCodes.OK).json({
        data: groupPermission,
        message: "Get group permission successfully",
      });
    }
  );
  public getBoardPermissionByBoardUser = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const boardId = req.params.id;
      const groupPermission =
        await this.boardPermissionService.getBoardPermissionByBoardUser(
          userId,
          boardId
        );
      res.status(StatusCodes.OK).json({
        data: groupPermission,
        message: "Get group permission successfully",
      });
    }
  );
  public deleteBoardPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const permissionId = req.params.id;
      const boardId = req.params.boardId;
      session.startTransaction();
      await this.boardPermissionService.deleteBoardPermission(
        userId,
        boardId,
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
