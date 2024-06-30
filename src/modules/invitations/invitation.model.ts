import { INVITE_STATUS, MODEL_NAME, OBJECT_ID, SCHEMA_TYPE } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IInvitationWorkspace from "./invitation.interface";

const InvitationWorkspaceSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.teamWorkspace,
    },
    senderId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.user,
    },
    receiverId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.user,
    },
    status: {
      type: String,
      enum: [
        INVITE_STATUS.pending,
        INVITE_STATUS.accepted,
        INVITE_STATUS.rejected,
      ],
      default: INVITE_STATUS.pending,
    },
    wsPermissionId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.workspacePermission,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

InvitationWorkspaceSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const invitation = this;
    invitation.find({ active: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<IInvitationWorkspace & mongoose.Document>(
  MODEL_NAME.invitationWorkspace,
  InvitationWorkspaceSchema
);
