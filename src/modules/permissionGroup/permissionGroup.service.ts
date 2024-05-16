import { BoardSchema } from "@modules/boards";
import AddPermissionGroupDto from "./dtos/addPermissionGroupDto";
import GroupPermissionSchema from "./permissionGroup.model";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import { isBoardAdmin, isEmptyObject } from "@core/utils";
import UpdatePermissionGroupDto from "./dtos/updatePermissionGroupDtp";
import IPermissionGroup from "./permissionGroup.interface";
export default class PermissionGroupService {
  private groupPermissionSchema = GroupPermissionSchema;
  private boardSchema = BoardSchema;
  public async createGroupPermission(
    userId: string,
    boardId: string,
    model: AddPermissionGroupDto
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
    await this.groupPermissionSchema.create({
      ...model,
      boardId,
    });
  }
  public async updateGroupPermission(
    userId: string,
    permissionId: string,
    model: UpdatePermissionGroupDto
  ): Promise<void> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const permissionGroup = await this.groupPermissionSchema.findById(
      permissionId
    );
    if (!permissionGroup) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        "Permission group not found"
      );
    }
    const checkBoardAdmin = await isBoardAdmin(permissionGroup.boardId, userId);
    if (!checkBoardAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to perform this action"
      );
    }
    await this.groupPermissionSchema.findByIdAndUpdate(permissionId, model);
  }
  public async getGroupPermissionByBoardId(
    userId: string,
    boardId: string
  ): Promise<IPermissionGroup[]> {
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
    const groupPermission = await this.groupPermissionSchema.find({
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
  public async getGroupPermissionByBoardUser(
    userId: string,
    boardId: string
  ): Promise<IPermissionGroup> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    const groupPermission = await this.groupPermissionSchema.findOne({
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
