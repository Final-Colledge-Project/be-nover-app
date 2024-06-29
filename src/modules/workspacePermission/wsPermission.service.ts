import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import {
  ROLE,
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
import { difference } from "lodash";
import { ClientSession } from "mongoose";
import { isVariableWidth } from "class-validator";
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
    //Handle members in perm
    if (model.memberIds && model.memberIds.length) {
      const owner = workspace.workspaceAdmins.filter((item) => {
        item.role === ROLE.superAdmin;
      })[0];
      if (model.memberIds.includes(owner.user.toString())) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Owner cannot be added to permission group"
        );
      }
      const existedMember = (workspace.workspaceMembers || []).some((item) =>
        (model.memberIds || []).includes(item.user.toString())
      );
      if (!existedMember) {
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
    model: UpdateWSPermissionDto,
    session: ClientSession
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

    if (wsPermission.isWSAdmin || wsPermission.isWSViewer) {
      if (
        difference(Object.keys(model), ["memberIds", "description"]).length > 0
      ) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Cannot update other fields except members"
        );
      }
    }

    const wsSuperAdmin = await isWorkspaceAdmin(
      wsPermission.workspaceId,
      userId
    );
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

    let updateModel = model;
    if (model.memberIds) {
      const owner = workspace.workspaceAdmins.filter((item) => {
        item.role === ROLE.superAdmin;
      })[0];
      if (model.memberIds.includes(owner.user.toString())) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Owner cannot be added to permission group"
        );
      }
      const existedMember = (workspace.workspaceMembers || []).some((item) =>
        (model.memberIds || []).includes(item.user.toString())
      );
      if (!existedMember) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Member not found in workspace"
        );
      }

      const viewerPerm = await this.wsPermissionSchema
        .findOne({
          workspaceId: wsPermission.workspaceId,
          isWSViewer: true,
        })
        .exec();
      if (!viewerPerm) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Viewer permission not found"
        );
      }
      const memberInPerm = wsPermission.memberIds || [];
      const addIds = difference(
        model.memberIds,
        memberInPerm
          .map((i) => i.toString())
          .filter((item) => item !== owner.user)
      );
      const removeIds = difference(
        memberInPerm
          .map((i) => i.toString())
          .filter((item) => item !== owner.user),
        model.memberIds
      );
      wsPermission.memberIds = [...new Set([...memberInPerm, ...addIds])];
      if (viewerPerm && viewerPerm._id.toString() !== permissionId) {
        wsPermission.memberIds = wsPermission.memberIds.filter(
          (i: string) => !removeIds.includes(i.toString())
        );
      }
      await wsPermission.save({ session });
      viewerPerm.memberIds = [
        ...new Set([
          ...viewerPerm?.memberIds.map((i) => i.toString()),
          ...removeIds,
        ]),
      ];
      await viewerPerm.save({ session });
      //Remove member from other perm
      const otherPerm = await this.wsPermissionSchema
        .find({
          workspaceId: wsPermission.workspaceId,
          _id: { $ne: permissionId },
        })
        .exec();
      if (otherPerm && addIds.length > 0) {
        const listPromise = otherPerm.map((perm) => {
          perm.memberIds = perm.memberIds.filter(
            (i: string) => !addIds.includes(i.toString())
          );
          return perm.save({ session });
        });
        await Promise.all(listPromise);
      }
    } 
    if (updateModel && updateModel.hasOwnProperty('memberIds')) {
      const { memberIds, ...otherProps } = updateModel;
      updateModel = {
        ...otherProps,
      };
    }
      await this.wsPermissionSchema.findByIdAndUpdate(
        permissionId,
        updateModel,
        { session }
      );
    
    await session.commitTransaction();
    session.endSession();
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
  public deleteWSPermission = async (
    userId: string,
    workspaceId: string,
    permId: string,
    session: ClientSession
  ) => {
    const isAdmin = isWorkspaceAdmin(workspaceId, userId);
    if (!isAdmin) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    const perm = await this.wsPermissionSchema.findById(permId).exec();
    if (!perm) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Permission not found");
    }
    if (perm.isWSAdmin || perm.isWSViewer) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Cannot delete default permission"
      );
    }
    if (perm.memberIds.length) {
      const viewerPerm = await this.wsPermissionSchema.findOne({
        workspaceId: workspaceId,
        isViewer: true,
      });
      if (!viewerPerm) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Viewer permission not found"
        );
      }
      viewerPerm.memberIds = [
        ...new Set([
          ...viewerPerm.memberIds.map((i) => i.toString()),
          ...perm.memberIds.map((i) => i.toString()),
        ]),
      ];
      await viewerPerm.save({ session });
    }
    await this.wsPermissionSchema.findByIdAndDelete(permId, { session });
    await session.commitTransaction();
    session.endSession();
  };
}
