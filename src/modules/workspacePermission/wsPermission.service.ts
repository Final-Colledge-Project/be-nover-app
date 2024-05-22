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
import { TeamWorkspaceSchema } from "@modules/teamWorkspace";
import { UserSchema } from "@modules/users";
export default class WorkspacePermissionService {
  private wsPermissionSchema = WorkspacePermissionSchema;
  private teamWorkspaceSchema = TeamWorkspaceSchema;
  private userSchema = UserSchema;
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
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    const workspace = await this.teamWorkspaceSchema.findById(wsId);
    if (!workspace) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Workspace not found");
    }
    const existUser = await this.userSchema.find({
      _id: { $in: model.memberIds },
    });
    if (!existUser || existUser.length !== (model.memberIds || []).length) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "User not found");
    }
    const existedMember = (workspace.workspaceMembers || []).some((item) =>
      (model.memberIds || []).includes(item.user.toString())
    );
    if (!existedMember && (model.memberIds || []).length > 0) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Member not found in workspace"
      );
    }
    const exitMemInPerm = await this.wsPermissionSchema.findOne({
      workspaceId: wsId,
      memberIds: { $in: model.memberIds },
    });
    if (exitMemInPerm && (model.memberIds || []).length > 0) {
      const listPromise = (model.memberIds || []).map((item) => {
        if ((exitMemInPerm.memberIds || []).includes(item)) {
          exitMemInPerm.memberIds = (exitMemInPerm.memberIds || []).filter(
            (i: string) => i.toString() !== item
          );
          return exitMemInPerm.save();
        }
      });
      await Promise.all(listPromise);
    }
    const workspacePerm = await this.wsPermissionSchema.create({
      ...model,
      workspaceId: wsId,
    });
    if (!workspacePerm) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "Create workspace permission failed"
      );
    }
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

    const wsSuperAdmin = await isSuperAdmin(wsPermission.workspaceId, userId);
    if (!wsSuperAdmin) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    const workspace = await this.teamWorkspaceSchema.findById(
      wsPermission.workspaceId
    );
    if (!workspace) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Workspace not found");
    }
    const existUser = await this.userSchema.find({
      _id: { $in: model.memberIds },
    });
    if (
      !existUser ||
      (existUser || []).length !== (model.memberIds || []).length
    ) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "User not found");
    }
    const existedMember = (workspace.workspaceMembers || []).some((item) =>
      (model.memberIds || []).includes(item.user.toString())
    );
    if (!existedMember && (model.memberIds || []).length > 0) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Member not found in workspace"
      );
    }
    const exitMemInPerm = await this.wsPermissionSchema.findOne({
      workspaceId: wsPermission.workspaceId,
      memberIds: { $in: model.memberIds },
    });
    if (
      exitMemInPerm &&
      (model.memberIds || []).length > 0 &&
      exitMemInPerm._id.toString() !== permissionId
    ) {
      const listPromise = (model.memberIds || []).map((item) => {
        if ((exitMemInPerm.memberIds || []).includes(item)) {
          exitMemInPerm.memberIds = (exitMemInPerm.memberIds || []).filter(
            (i: string) => i.toString() !== item
          );
          return exitMemInPerm.save();
        }
      });
      await Promise.all(listPromise);
    }
    const removeIds: string[] = [];
    (wsPermission.memberIds || []).forEach((item) => {
      if (!(model.memberIds || []).includes(item))
        removeIds.push(item.toString());
    });
    const viewerPerm = await this.wsPermissionSchema
      .findOne({
        workspaceId: wsPermission.workspaceId,
        isWSViewer: true,
      })
      .exec();
    let updateMemberIds: string[] = [];
    if (viewerPerm && removeIds.length > 0) {
      updateMemberIds = [
        ...new Set([
          ...viewerPerm.memberIds.map((item) => item.toString()),
          ...removeIds,
        ]),
      ];
      if (viewerPerm._id.toString() !== permissionId) {
        viewerPerm.memberIds = updateMemberIds;
        await viewerPerm.save();
      }
    }
    let updateModel = model;
    if (wsPermission.isWSViewer && removeIds.length > 0) {
      updateModel = {
        ...model,
        memberIds: updateMemberIds,
      };
    }
    await this.wsPermissionSchema.findByIdAndUpdate(permissionId, updateModel);
  }
  public async getWSPermissionByWSId(
    userId: string,
    wsId: string
  ): Promise<IWorkspacePermission[]> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    const wsSuperAdmin = await isSuperAdmin(wsId, userId);
    if (!wsSuperAdmin) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
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
  public async getWSPermissionByUser(
    userId: string,
    wsId: string
  ): Promise<IWorkspacePermission> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    const groupPermission = await this.wsPermissionSchema
      .findOne({
        workspaceId: wsId,
        memberIds: {
          $in: [userId],
        },
      })
      .select("-memberIds")
      .exec();
    if (!groupPermission) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        "Permission group not found"
      );
    }
    return groupPermission;
  }
}
