import AddBoardPermissionDto from "./dtos/addBoardPermissionDto";
import BoardPermissionSchema from "./boardPermission.model";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import { isBoardAdmin, isEmptyObject } from "@core/utils";
import UpdateBoardPermissionDto from "./dtos/updateBoardPermissionDto";
import IBoardPermission from "./boardPermission.interface";
import { UserSchema } from "@modules/users";
import { BoardSchema } from "@modules/boards";
import { ClientSession } from "mongoose";
import { add, difference, intersection } from "lodash";
import { TeamWorkspaceSchema } from "@modules/teamWorkspace";
export default class BoardPermissionService {
  private boardPermissionSchema = BoardPermissionSchema;
  private userSchema = UserSchema;
  private boardSchema = BoardSchema;
  private workspaceSchema = TeamWorkspaceSchema;
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
    const existUser = await this.userSchema.find({
      _id: { $in: model.memberIds },
    });
    if (
      !existUser ||
      (existUser || []).length !== (model.memberIds || []).length
    ) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "User not found");
    }
    const checkBoardAdmin = await isBoardAdmin(boardId, userId);
    if (!checkBoardAdmin) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    const board = await this.boardSchema.findById(boardId);
    if (model.memberIds && model.memberIds.length > 0) {
      const owner = board?.ownerIds[0].toString();
      if (model.memberIds.includes(owner || "")) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Owner must be in permission"
        );
      }
      const workspace = await this.workspaceSchema
        .findById(board?.teamWorkspaceId)
        .exec();
      const superAdmin = workspace?.workspaceAdmins
        .filter((item) => item.role === "superAdmin")
        .map((item) => item.user.toString())[0];
      const existedMember = (board?.memberIds || []).some((item) =>
        (model.memberIds || []).includes(item.toString())
      );
      if (!existedMember && (model.memberIds || []).length > 0 && !superAdmin) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Member not found in board"
        );
      }
      const exitMemInPerm = await this.boardPermissionSchema.findOne({
        boardId: boardId,
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
    await this.boardPermissionSchema.create({
      ...model,
      boardId,
    });
  }
  public async updateBoardPermission(
    userId: string,
    permissionId: string,
    model: UpdateBoardPermissionDto,
    session: ClientSession
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
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    if (boardPermission.isAdmin || boardPermission.isViewer) {
      if (
        difference(Object.keys(model), ["memberIds", "description"]).length > 0
      ) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Cannot update other fields except members"
        );
      }
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
    const board = await this.boardSchema.findById(boardPermission.boardId);
    let updateModel = model;
    //Handle memberIds in perm
    if (model.memberIds && model.memberIds.length > 0) {
      const owner = board?.ownerIds[0].toString();
      if (model.memberIds.includes(owner || "")) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Owner must be in permission"
        );
      }
      const existedMember = (board?.memberIds || []).some((item) =>
        (model.memberIds || []).includes(item.toString())
      );
      const workspace = await this.workspaceSchema
        .findById(board?.teamWorkspaceId)
        .exec();
      const superAdmin = workspace?.workspaceAdmins
        .filter((item) => item.role === "superAdmin")
        .map((item) => item.user.toString())[0];
      if (!existedMember && !superAdmin) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Member not found in board"
        );
      }
      const viewerPerm = await this.boardPermissionSchema
        .findOne({
          boardId: boardPermission.boardId,
          isViewer: true,
        })
        .exec();
      if (!viewerPerm) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Viewer permission not found"
        );
      }
      const memberInPerm = boardPermission.memberIds || [];
      const addIds = difference(
        model.memberIds,
        memberInPerm.map((i) => i.toString()).filter((item) => item !== owner)
      );
      const removeIds = difference(
        memberInPerm.map((i) => i.toString()).filter((item) => item !== owner),
        model.memberIds
      );

      boardPermission.memberIds = [...new Set([...memberInPerm, ...addIds])];
      if (viewerPerm && viewerPerm._id.toString() !== permissionId) {
        boardPermission.memberIds = boardPermission.memberIds.filter(
          (i: string) => !removeIds.includes(i.toString())
        );
      }
      await boardPermission.save({ session });
      viewerPerm.memberIds = [
        ...new Set([
          ...viewerPerm?.memberIds.map((i) => i.toString()),
          ...removeIds,
        ]),
      ];

      await viewerPerm.save({ session });

      //Remove member from other perm
      const otherPerm = await this.boardPermissionSchema
        .find({
          boardId: boardPermission.boardId,
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
    } else {
      await this.boardPermissionSchema.findByIdAndUpdate(
        permissionId,
        updateModel,
        { session }
      );
    }
    await session.commitTransaction();
    session.endSession();
  }
  public async getBoardPermissionByBoardId(
    userId: string,
    boardId: string
  ): Promise<IBoardPermission[]> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
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
    const groupPermission = await this.boardPermissionSchema
      .findOne({
        boardId,
        memberIds: {
          $in: [userId],
        },
      })
      .select("-memberIds")
      .exec();
    if (!groupPermission) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Permission denied");
    }
    return groupPermission;
  }
  public deleteBoardPermission = async (
    userId: string,
    boardId: string,
    permId: string,
    session: ClientSession
  ) => {
    const adminBoardPerm = await this.boardPermissionSchema
      .findOne({
        boardId,
        isAdmin: true,
      })
      .exec();
    if (!adminBoardPerm) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Admin permission not found"
      );
    }
    const isInAdminPerm = adminBoardPerm.memberIds.includes(userId);
    if (!isInAdminPerm) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    const perm = await this.boardPermissionSchema.findById(permId).exec();
    if (!perm) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Permission not found");
    }
    if (perm.isAdmin || perm.isViewer) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Cannot delete default permission"
      );
    }
    if (perm.memberIds.length) {
      const viewerPerm = await this.boardPermissionSchema.findOne({
        boardId,
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
    await this.boardPermissionSchema.findByIdAndDelete(permId, { session });
    await session.commitTransaction();
    session.endSession();
  };
}
