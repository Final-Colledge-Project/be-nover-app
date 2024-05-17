import AddBoardPermissionDto from "./dtos/addBoardPermissionDto";
import BoardPermissionSchema from "./boardPermission.model";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import { isBoardAdmin, isEmptyObject } from "@core/utils";
import UpdateBoardPermissionDto from "./dtos/updateBoardPermissionDto";
import IBoardPermission from "./boardPermission.interface";
export default class BoardPermissionService {
  private boardPermissionSchema = BoardPermissionSchema;
  public async createBoardPermission(
    userId: string,
    boardId: string,
    model: AddBoardPermissionDto
  ): Promise<void> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const checkBoardAdmin = await isBoardAdmin(boardId, userId);
    if (!checkBoardAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to perform this action"
      );
    }
    await this.boardPermissionSchema.create({
      ...model,
      boardId,
    });
  }
  public async updateBoardPermission(
    userId: string,
    permissionId: string,
    model: UpdateBoardPermissionDto
  ): Promise<void> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const boardPermission = await this.boardPermissionSchema.findById(
      permissionId
    );
    if (!boardPermission) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        "Permission group not found"
      );
    }
    const checkBoardAdmin = await isBoardAdmin(boardPermission.boardId, userId);
    if (!checkBoardAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to perform this action"
      );
    }
    await this.boardPermissionSchema.findByIdAndUpdate(permissionId, model);
  }
  public async getBoardPermissionByBoardId(
    userId: string,
    boardId: string
  ): Promise<IBoardPermission[]> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    const checkBoardAdmin = await isBoardAdmin(boardId, userId);
    if (!checkBoardAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to perform this action"
      );
    }
    const groupPermission = await this.boardPermissionSchema.find({
      boardId,
    });
    if (!groupPermission) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        "Permission group not found"
      );
    }
    return groupPermission;
  }
  public async getBoardPermissionByBoardUser(
    userId: string,
    boardId: string
  ): Promise<IBoardPermission> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    const groupPermission = await this.boardPermissionSchema.findOne({
      boardId,
      memberIds: {
        $in: userId,
      },
    });
    if (!groupPermission) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        "Permission group not found"
      );
    }
    return groupPermission;
  }
}
