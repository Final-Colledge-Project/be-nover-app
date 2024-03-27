import {
  Email,
  OBJECT_ID,
  isEmptyObject,
  isSuperAdmin,
  isWorkspaceAdmin,
  isWorkspaceMember,
  permissionWorkspace,
  viewWorkspacePermission,
} from "@core/utils";
import CreateTeamWorkspaceDto from "./dtos/createTeamWorkspace.dto";
import TeamWorkspaceSchema from "./teamWorkspace.model";
import { HttpException } from "@core/exceptions";
import JoinGroupDto from "./dtos/joinGroup.dto";
import { UserSchema } from "@modules/users";
import ITeamWorkspace, { IWorkspaceAdmin } from "./teamWorkspace.interface";
import { StatusCodes } from "http-status-codes";
import { BoardSchema } from "@modules/boards";
import { ColumnSchema } from "@modules/columns";
import { CardSchema } from "@modules/cards";
import { LabelSchema } from "@modules/labels";
class TeamWorkspaceService {
  public teamWorkspaceSchema = TeamWorkspaceSchema;
  public async createTeamWorkspace(
    model: CreateTeamWorkspaceDto
  ): Promise<Object> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const superAdminId = model.superAdminWorkspaceId;
    const teamWorkspace = await this.teamWorkspaceSchema
      .findOne({ name: model.name, isActive: true })
      .exec();
    if (
      teamWorkspace &&
      teamWorkspace.workspaceAdmins.find(
        (admin) => admin.user.toString() === superAdminId
      )
    ) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        `Team workspace with name ${model.name} already exists`
      );
    }
    const newWorskspace = await this.teamWorkspaceSchema.create({
      name: model.name,
      workspaceAdmins: [{ user: superAdminId, role: "superAdmin" }],
    });
    if (!newWorskspace) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "Create team workspace failed"
      );
    }

    return {
      id: newWorskspace.id,
      name: newWorskspace.name,
      workspaceSuperAdmins: superAdminId,
    };
  }
  public async assignMemberToAdmin(
    model: JoinGroupDto,
    workspaceId: string,
    adminId: string
  ): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const teamWorkspace = await this.teamWorkspaceSchema
      .findById(workspaceId)
      .exec();
    if (!teamWorkspace) {
      throw new HttpException(StatusCodes.CONFLICT, "Workspace not found");
    }
    const member = await UserSchema.findOne({ email: model.emailUser }).exec();
    if ((await isWorkspaceAdmin(workspaceId, member?.id)) === true) {
      throw new HttpException(StatusCodes.CONFLICT, "User is already admin");
    }
    if ((await isWorkspaceMember(workspaceId, member?.id)) === false) {
      throw new HttpException(StatusCodes.CONFLICT, "User is not member");
    }
    if ((await isSuperAdmin(workspaceId, adminId)) === false) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "You are not permission to assign member to admin"
      );
    }
    teamWorkspace.workspaceAdmins.push({
      user: member?.id,
      role: "admin",
    } as IWorkspaceAdmin);
    teamWorkspace.workspaceMembers = teamWorkspace.workspaceMembers.filter(
      (mem: any) => mem.user.toString() !== member?.id.toString()
    );
    await teamWorkspace.save();
  }
  public async getTeamWorkspaceById(userId: string, workspaceId: string) {
    if ((await viewWorkspacePermission(workspaceId, userId)) === false) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "You are not permission to view this workspace"
      );
    }
    const workspace = await this.teamWorkspaceSchema
      .findById(workspaceId)
      .exec();
    if (!workspace) {
      throw new HttpException(409, "Workspace not found");
    }
    return workspace;
  }
  public async getMemberTeamWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<Object> {
    if ((await viewWorkspacePermission(workspaceId, userId)) === false) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "You are not permission to view this workspace"
      );
    }
    const workspaceAdmins = await this.teamWorkspaceSchema.aggregate([
      {
        $match: {
          $expr: {
            $eq: ["$_id", new OBJECT_ID(workspaceId)],
          },
        },
      },
      {
        $unwind: {
          path: "$workspaceAdmins",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { workspaceAdmins: "$workspaceAdmins.user" },
          localField: "workspaceAdmins.user",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$workspaceAdmins"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                avatar: 1,
                email: 1,
              },
            },
          ],
          as: "workspaceAdmins.user",
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          workspaceAdmins: {
            $push: {
              user: {
                $arrayElemAt: ["$workspaceAdmins.user", 0],
              },
              role: "$workspaceAdmins.role",
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          workspaceAdmins: 1,
        },
      },
    ]);

    const workspaceMember = await this.teamWorkspaceSchema.aggregate([
      {
        $match: {
          $expr: {
            $eq: ["$_id", new OBJECT_ID(workspaceId)],
          },
        },
      },
      {
        $unwind: {
          path: "$workspaceMembers",
          preserveNullAndEmptyArrays: true,
        },
      }, // unwind the workspaceAdmins array
      {
        $lookup: {
          from: "users",
          let: { workspaceMembers: "$workspaceMembers.user" },
          localField: "workspaceMembers.user",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$workspaceMembers"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                avatar: 1,
                email: 1,
              },
            },
          ],
          as: "workspaceMembers.user",
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          workspaceMembers: {
            $push: {
              user: {
                $arrayElemAt: ["$workspaceMembers.user", 0],
              },
            },
          },
        },
      },
      {
        $project: {
          workspaceMembers: 1,
        },
      },
    ]);
    return {
      ...workspaceAdmins[0],
      ...workspaceMember[0],
    };
  }
  public async deleteWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<void> {
    const workspace = await this.teamWorkspaceSchema
      .findById(workspaceId)
      .exec();
    if (!workspace) {
      throw new HttpException(StatusCodes.CONFLICT, "Workspace not found");
    }
    const checkSuperAdmin = await isSuperAdmin(workspaceId, userId);
    if (!checkSuperAdmin) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "You are not permission to delete this workspace"
      );
    }

    const deletedBoard = await BoardSchema.find({
      teamWorkspaceId: workspaceId,
      isActive: true,
    }).exec();
    const filterDeleteBoard = { teamWorkspaceId: workspaceId, isActive: true };
    const updateBoard = {
      $set: { isActive: false, updatedAt: Date.now() },
    };
    await BoardSchema.updateMany(filterDeleteBoard, updateBoard);

    deletedBoard.forEach(async (board) => {
      const filterDelete = { boardId: board.id };
      const updateOperation = {
        $set: { isActive: false, updatedAt: Date.now() },
      };
      await ColumnSchema.updateMany(filterDelete, updateOperation);
      await CardSchema.updateMany(filterDelete, updateOperation);
      await LabelSchema.updateMany(filterDelete, updateOperation);
    });
    workspace.isActive = false;
    await workspace.save();
  }
}

export default TeamWorkspaceService;
