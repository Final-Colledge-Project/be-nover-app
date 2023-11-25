import {
  Email,
  OBJECT_ID,
  isEmptyObject,
  isSuperAdmin,
  isWorkspaceAdmin,
  isWorkspaceMember,
} from "@core/utils";
import CreateTeamWorkspaceDto from "./dtos/createTeamWorkspace.dto";
import TeamWorkspaceSchema from "./teamWorkspace.model";
import { HttpException } from "@core/exceptions";
import JoinGroupDto from "./dtos/joinGroup.dto";
import { UserSchema } from "@modules/users";
import { IWorkspaceAdmin } from "./teamWorkspace.interface";
class TeamWorkspaceService {
  public teamWorkspaceSchema = TeamWorkspaceSchema;
  public async createTeamWorkspace(
    model: CreateTeamWorkspaceDto
  ): Promise<Object> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const superAdminId = model.superAdminWorkspaceId;
    const teamWorkspace = await this.teamWorkspaceSchema
      .findOne({ name: model.name })
      .exec();
    if (
      teamWorkspace &&
      teamWorkspace.workspaceAdmins.find(
        (admin) => admin.user.toString() === superAdminId
      )
    ) {
      throw new HttpException(
        409,
        `Team workspace with name ${model.name} already exists`
      );
    }
    const newWorskspace = await this.teamWorkspaceSchema.create({
      name: model.name,
      workspaceAdmins: [{ user: superAdminId, role: "superAdmin" }],
    });
    if (!newWorskspace) {
      throw new HttpException(409, "Create team workspace failed");
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
      throw new HttpException(400, "Model is empty");
    }
    const teamWorkspace = await this.teamWorkspaceSchema
      .findById(workspaceId)
      .exec();
    const member = await UserSchema.findOne({ email: model.emailUser }).exec();
    if (!teamWorkspace) {
      throw new HttpException(409, "Workspace not found");
    }
    if ((await isSuperAdmin(workspaceId, adminId)) === false) {
      throw new HttpException(
        409,
        "You are not permission to assign member to admin"
      );
    }
    if ((await isWorkspaceAdmin(workspaceId, member?.id)) === true) {
      throw new HttpException(409, "User is already admin");
    }
    if ((await isWorkspaceMember(workspaceId, member?.id)) === false) {
      throw new HttpException(409, "User is not member");
    }

    teamWorkspace.workspaceAdmins.unshift({
      user: member?.id,
      role: "admin",
    } as IWorkspaceAdmin);
    await teamWorkspace.save();
  }
  public async getTeamWorkspaceById(userId: string, workspaceId: string) {
    const checkMember = await isWorkspaceMember(workspaceId, userId);
    if (checkMember === false) {
      throw new HttpException(409, "You are not member of this workspace");
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
    const checkMember = await isWorkspaceMember(workspaceId, userId);
    if (checkMember === false) {
      throw new HttpException(409, "You are not member of this workspace");
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
        $unwind: "$workspaceAdmins",
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
        $unwind: "$workspaceMembers", // unwind the workspaceAdmins array
      },
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
}

export default TeamWorkspaceService;
