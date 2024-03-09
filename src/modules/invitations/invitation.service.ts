import {
  Email,
  INVITE_STATUS,
  MODEL_NAME,
  OBJECT_ID,
  isEmptyObject,
  isSuperAdmin,
  isWorkspaceAdmin,
  isWorkspaceMember,
  permissionWorkspace,
} from "@core/utils";
import InvitationSchema from "./invitation.model";
import { HttpException } from "@core/exceptions";
import { UserSchema } from "@modules/users";
import { TeamWorkspaceSchema } from "@modules/teamWorkspace";
import IInvitationWorkspace from "./invitation.interface";
import JoinGroupDto from "./dtos/joinGroupDto";
import { StatusCodes } from "http-status-codes";
export default class InvitationService {
  private invitationSchema = InvitationSchema;
  private teamWorkspaceSchema = TeamWorkspaceSchema;
  public async sendInvitation(
    model: JoinGroupDto,
    adminId: string,
    workspaceId: string
  ): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.CONFLICT, "Model is empty");
    }
    const adminUser = await UserSchema.findById(adminId).exec();
    const invitedUser = await UserSchema.findOne({
      email: model.emailUser,
    }).exec();
    const checkPermissionWorkspace = await permissionWorkspace(
      workspaceId,
      adminId
    );
    if (!checkPermissionWorkspace) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You have not permission to invite member"
      );
    }
    if (!adminUser) {
      throw new HttpException(StatusCodes.CONFLICT, "You are not an user");
    }
    if (!invitedUser) {
      throw new HttpException(StatusCodes.CONFLICT, "User not found");
    }
    const teamWorkspace = await this.teamWorkspaceSchema
      .findById(workspaceId)
      .exec();
    if (!teamWorkspace) {
      throw new HttpException(StatusCodes.CONFLICT, "Workspace not found");
    }

    if (await isWorkspaceAdmin(workspaceId, invitedUser.id)) {
      throw new HttpException(StatusCodes.CONFLICT, "User is already an admin");
    }
    if (await isWorkspaceMember(workspaceId, invitedUser.id)) {
      throw new HttpException(StatusCodes.CONFLICT, "User is already a member");
    }
    const existInvitation = await this.invitationSchema.findOne({
      workspaceId: new OBJECT_ID(workspaceId),
      receiverId: new OBJECT_ID(invitedUser.id),
    });
    let invitation: IInvitationWorkspace;
    if (existInvitation) {
      const updateInvitation = await this.invitationSchema
        .findByIdAndUpdate(
          existInvitation.id,
          { status: INVITE_STATUS.pending, updatedAt: Date.now() },
          { new: true }
        )
        .exec();
      if (!updateInvitation) {
        throw new HttpException(
          StatusCodes.CONFLICT,
          "Update invitation failed"
        );
      }
      invitation = updateInvitation;
    } else {
      invitation = await this.invitationSchema.create({
        workspaceId: new OBJECT_ID(workspaceId),
        senderId: new OBJECT_ID(adminId),
        receiverId: new OBJECT_ID(invitedUser.id),
        status: INVITE_STATUS.pending,
      });
    }
    const url = `http://localhost:5173/u/invitation/${invitation._id}`;
    await new Email(
      invitedUser,
      url,
      adminUser,
      invitation
    ).sendInvitationMember();
  }
  public async responseInvitation(
    userId: string,
    workspaceId: string,
    status: string
  ): Promise<void> {
    const teamWorkspace = await this.teamWorkspaceSchema
      .findById(workspaceId)
      .exec();
    if (!teamWorkspace) {
      throw new HttpException(StatusCodes.CONFLICT, "Workspace not found");
    }
    if (await isWorkspaceAdmin(workspaceId, userId)) {
      throw new HttpException(StatusCodes.CONFLICT, "User is already an admin");
    }
    if (await isWorkspaceMember(workspaceId, userId)) {
      throw new HttpException(StatusCodes.CONFLICT, "User is already a member");
    }
    const existedInvitation = await this.invitationSchema.findOne({
      workspaceId: new OBJECT_ID(workspaceId),
      receiverId: new OBJECT_ID(userId),
    });
    if (!existedInvitation) {
      throw new HttpException(StatusCodes.CONFLICT, "Invitation not found");
    }
    await this.invitationSchema
      .findOneAndUpdate(
        {
          _id: existedInvitation.id,
          receiverId: userId,
        },
        {
          status: status,
        }
      )
      .exec();
    if (status === INVITE_STATUS.accepted) {
      await this.teamWorkspaceSchema
        .findOneAndUpdate(
          {
            _id: workspaceId,
          },
          {
            $push: {
              workspaceMembers: {
                user: userId,
              },
            },
          }
        )
        .exec();
    }
  }
  public async getInvitationDetail(
    invitationId: string
  ): Promise<IInvitationWorkspace> {
    const existInvitation = await this.invitationSchema
      .findById(invitationId)
      .exec();
    if (!existInvitation) {
      throw new HttpException(StatusCodes.CONFLICT, "Invitation not found");
    }
    const invitationDetail = await this.invitationSchema
      .aggregate([
        {
          $match: {
            _id: new OBJECT_ID(invitationId),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "teamworkspaces",
            let: { workspaceId: "$workspaceId" },
            localField: "workspaceId",
            foreignField: "_id",
            as: "teamWorkspace",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$workspaceId"],
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
                  _id: 1,
                  name: 1,
                  workspaceAdmins: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "teamworkspaces",
            let: { workspaceId: "$workspaceId" },
            localField: "workspaceId",
            foreignField: "_id",
            as: "teamWorkspaceMember",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$workspaceId"],
                  },
                },
              },
              {
                $unwind: {
                  path: "$workspaceMembers",
                  preserveNullAndEmptyArrays: true,
                },
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
                      },
                    },
                  ],
                  as: "workspaceMembers.user",
                },
              },
              {
                $group: {
                  _id: "$_id",
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
                  _id: 0,
                  workspaceMembers: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            let: { senderId: "$senderId" },
            localField: "senderId",
            foreignField: "_id",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$senderId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: { $concat: ["$firstName", " ", "$lastName"] },
                  avatar: 1,
                },
              },
            ],
            as: "senders",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { receiverId: "$receiverId" },
            localField: "receiverId",
            foreignField: "_id",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$receiverId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: { $concat: ["$firstName", " ", "$lastName"] },
                  avatar: 1,
                },
              },
            ],
            as: "receiver",
          },
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            teamWorkspace: {
              $arrayElemAt: ["$teamWorkspace", 0],
            },
            senders: {
              $arrayElemAt: ["$senders", 0],
            },
            receiver: {
              $arrayElemAt: ["$receiver", 0],
            },
            teamWorkspaceMember: {
              $arrayElemAt: ["$teamWorkspaceMember", 0],
            },
          },
        },
      ])
      .exec();
    return invitationDetail[0];
  }
}
