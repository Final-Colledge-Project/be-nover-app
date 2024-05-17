import { catchAsync } from "@core/utils";
import BoardPermissionService from "./boardPermission.service";
import { Request, Response } from "express";
import AddBoardPermissionDto from "./dtos/addBoardPermissionDto";
import UpdateBoardPermissionDto from "./dtos/updateBoardPermissionDto";
import { StatusCodes } from "http-status-codes";
export default class BoardPermissionController {
  private boardPermissionService = new BoardPermissionService();
  public createBoardPermission = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const boardId = req.params.id;
      const model: AddBoardPermissionDto = req.body;
      await this.boardPermissionService.createBoardPermission(
        userId,
        boardId,
        model
      );
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Create group permission successfully" });
    }
  );
  public updateBoardPermission = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const permissionId = req.params.id;
      const model: UpdateBoardPermissionDto = req.body;
      await this.boardPermissionService.updateBoardPermission(
        userId,
        permissionId,
        model
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Update group permission successfully" });
    }
  );
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
}
