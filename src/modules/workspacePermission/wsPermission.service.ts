import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import {
  isBoardAdmin,
  isEmptyObject,
  isSuperAdmin,
  isWorkspaceAdmin,
} from "@core/utils";
import WorkspacePermissionSchema from "./wsPermission.model";
import AddWSPermissionDto from "./dtos/addWSPermissionDto";
import UpdateWSPermissionDto from "./dtos/updateWSPermissionDto";
import IWorkspacePermission from "./wsPermission.interface";
export default class WorkspacePermissionService {
  private wsPermissionSchema = WorkspacePermissionSchema;
  public async createWorkspacePermission(
    userId: string,
    wsId: string,
    model: AddWSPermissionDto
  ): Promise<void> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const wsSuperAdmin = await isSuperAdmin(wsId, userId);
    if (!wsSuperAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to perform this action"
      );
    }
    await this.wsPermissionSchema.create({
      ...model,
      workspaceId: wsId,
    });
  }
  public async updateWSPermission(
    userId: string,
    permissionId: string,
    model: UpdateWSPermissionDto
  ): Promise<void> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const wsPermission = await this.wsPermissionSchema.findById(permissionId);
    if (!wsPermission) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        "Permission group not found"
      );
    }
    const checkWSAdmin = await isWorkspaceAdmin(
      wsPermission.workspaceId,
      userId
    );
    if (!checkWSAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to perform this action"
      );
    }
    await this.wsPermissionSchema.findByIdAndUpdate(permissionId, model);
  }
  public async getWSPermissionByWSId(
    userId: string,
    wsId: string
  ): Promise<IWorkspacePermission[]> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    const checkBoardAdmin = await isBoardAdmin(wsId, userId);
    if (!checkBoardAdmin) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to perform this action"
      );
    }
    const groupPermission = await this.wsPermissionSchema.find({
      workspaceId: wsId,
    });
    if (!groupPermission) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        "Permission group not found"
      );
    }
    return groupPermission;
  }
  public async getWSPermissionByBoardUser(
    userId: string,
    wsId: string
  ): Promise<IWorkspacePermission> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    const groupPermission = await this.wsPermissionSchema.findOne({
      wsId,
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
