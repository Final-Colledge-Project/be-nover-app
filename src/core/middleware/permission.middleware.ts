import { HttpException } from "@core/exceptions";
import {
  PERM_TYPE,
  isSuperAdmin,
  isValidObjectId,
  viewWorkspacePermission,
} from "@core/utils";
import { BoardPermissionSchema } from "@modules/boardPermissions";
import { BoardSchema } from "@modules/boards";
import { TeamWorkspaceSchema } from "@modules/teamWorkspaces";
import { UserSchema } from "@modules/users";
import {
  IWorkspacePermission,
  WorkspacePermissionSchema,
} from "@modules/workspacePermissions";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { isBoolean } from "lodash";
import mongoose from "mongoose";
export const permissionMiddleware = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserSchema.findById(req.user.id).select("+role").exec();
    if (!user) {
      return next(
        new HttpException(
          401,
          "The user belonging to this token does no longer exist"
        )
      );
    }
    if (roles.includes(user.role)) {
      next();
    } else {
      return next(new HttpException(403, "Permission denied"));
    }
  };
};

export const authorizePermission = (roles: string, permType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const listPerm: Object = roles.split(",").reduce((item, acc) => {
      const perm = acc.split(":");
      const obj = perm[0].trim();
      const action = perm[1].trim();
      return {
        ...item,
        [obj]: action,
      };
    }, {});
    switch (permType) {
      case PERM_TYPE.workspace: {
        if (!isValidObjectId(req.params.wsId)) {
          return next(
            new HttpException(StatusCodes.BAD_REQUEST, "Workspace not found")
          );
        }
        const existedWS = await TeamWorkspaceSchema.findById(req.params.wsId);
        if (!existedWS) {
          return next(
            new HttpException(StatusCodes.BAD_REQUEST, "Workspace not found")
          );
        }
        const wsPermGroup = await WorkspacePermissionSchema.findOne({
          workspaceId: req.params.wsId,
          memberIds: {
            $in: [userId],
          },
          isActive: true,
        });
        if (!wsPermGroup) {
          return next(
            new HttpException(StatusCodes.FORBIDDEN, "Permission denied")
          );
        }

        let isHasPerm = false;
        let isViewPerm = false;
        (Object.keys(listPerm) || []).forEach((item) => {
          const wsPerm = (wsPermGroup as any)[item] || {};
          const wsKey = (listPerm as any)[item];
          if (wsPerm[wsKey]) {
            isHasPerm = true;
          }
          if (wsKey === "viewAll" && isBoolean(wsPerm[wsKey])) {
            isViewPerm = true;
          }
        });
        if (!isHasPerm && !isViewPerm) {
          return next(
            new HttpException(StatusCodes.FORBIDDEN, "Permission denied")
          );
        }
        next();
        break;
      }
      case PERM_TYPE.board: {
        const existedBoard = await BoardSchema.findById(req.params.boardId);
        if (!existedBoard) {
          return next(
            new HttpException(StatusCodes.BAD_REQUEST, "Board not found")
          );
        }
        const boardPermGroup = await BoardPermissionSchema.findOne({
          boardId: req.params.boardId,
          memberIds: {
            $in: [userId],
          },
          isActive: true,
        });
        if (!boardPermGroup) {
          return next(
            new HttpException(StatusCodes.FORBIDDEN, "Permission denied")
          );
        }
        if (boardPermGroup?.isAdmin) {
          return next();
        }
        let isHasPerm = false;
        (Object.keys(listPerm) || []).forEach((item) => {
          const wsPerm = (boardPermGroup as any)[item] || {};
          const wsKey = (listPerm as any)[item];
          if (wsPerm[wsKey]) {
            isHasPerm = true;
          }
        });
        if (!isHasPerm) {
          return next(
            new HttpException(StatusCodes.FORBIDDEN, "Permission denied")
          );
        }
        next();
        break;
      }
      default:
        return next(
          new HttpException(StatusCodes.FORBIDDEN, "Permission denied")
        );
    }
  };
};
