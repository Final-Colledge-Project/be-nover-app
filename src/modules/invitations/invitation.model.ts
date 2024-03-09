import { INVITE_STATUS, MODEL_NAME, OBJECT_ID } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IInvitationWorkspace from "./invitation.interface";

const InvitationWorkspaceSchema = new mongoose.Schema({
  workspaceId: {
    type: OBJECT_ID,
    ref: MODEL_NAME.teamWorkspace,
  },
  senderId: {
    type: OBJECT_ID,
    ref: MODEL_NAME.user
  },
  receiverId: {
    type: OBJECT_ID,
    ref: MODEL_NAME.user
  },
  createAt: {
    type: Date,
    default: Date.now
  },
  updateAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: [INVITE_STATUS.pending, INVITE_STATUS.accepted, INVITE_STATUS.rejected],
    default: INVITE_STATUS.pending
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

InvitationWorkspaceSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
      const invitation = this;
      invitation.find({ active: { $ne: false } }).select('-__v');
  }
  next();
});

export default mongoose.model<IInvitationWorkspace & mongoose.Document>(MODEL_NAME.invitationWorkspace, InvitationWorkspaceSchema)