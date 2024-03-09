import { INVITE_STATUS } from "@core/utils";

export default interface IInvitationWorkspace {
  _id: string;
  workspaceId: string;
  senderId: string;
  receiverId: string;
  createAt: Date;
  updateAt: Date;
  status: InviteStatus;
  isActive: boolean;
}

enum InviteStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected'
}




