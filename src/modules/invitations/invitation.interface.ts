export default interface IInvitationWorkspace {
  _id: string;
  workspaceId: string;
  senderId: string;
  receiverId: string;
  wsPermissionId: string;
  createAt: Date;
  updateAt: Date;
  status: InviteStatus;
  isActive: boolean;
}

enum InviteStatus {
  pending = "pending",
  accepted = "accepted",
  rejected = "rejected",
}
