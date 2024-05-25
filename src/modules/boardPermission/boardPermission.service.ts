import AddBoardPermissionDto from "./dtos/addBoardPermissionDto";
import BoardPermissionSchema from "./boardPermission.model";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import { isBoardAdmin, isEmptyObject } from "@core/utils";
import UpdateBoardPermissionDto from "./dtos/updateBoardPermissionDto";
import IBoardPermission from "./boardPermission.interface";
import { UserSchema } from "@modules/users";
import { BoardSchema } from "@modules/boards";
export default class BoardPermissionService {
  private boardPermissionSchema = BoardPermissionSchema;
  private userSchema = UserSchema;
  private boardSchema = BoardSchema;
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
    if (model.memberIds) {
      const existedMember = (board?.memberIds || []).some((item) =>
        (model.memberIds || []).includes(item.toString())
      );
      if (!existedMember && (model.memberIds || []).length > 0) {
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
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
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
    if (model.memberIds) {
      const existedMember = (board?.memberIds || []).some((item) =>
        (model.memberIds || []).includes(item.toString())
      );
      if (!existedMember && (model.memberIds || []).length > 0) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Member not found in board"
        );
      }
      const exitMemInPerm = await this.boardPermissionSchema.findOne({
        boardId: boardPermission.boardId,
        memberIds: { $in: model.memberIds },
      });
      if (
        exitMemInPerm &&
        (model.memberIds || []).length > 0 &&
        exitMemInPerm._id.toString() !== permissionId
      ) {
        const listPromise = model.memberIds.map((item) => {
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
      (boardPermission.memberIds || []).forEach((item) => {
        if (!(model.memberIds || []).includes(item))
          removeIds.push(item.toString());
      });
      const viewerPerm = await this.boardPermissionSchema
        .findOne({
          boardId: boardPermission.boardId,
          isViewer: true,
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

      if (boardPermission.isViewer && removeIds.length > 0) {
        updateModel = {
          ...model,
          memberIds: updateMemberIds,
        };
      }
    }
    await this.boardPermissionSchema.findByIdAndUpdate(
      permissionId,
      updateModel
    );
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
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
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
}
