export default interface IWorkspacePermission {
  _id: string;
  name: string;
  description: string;
  color: string;
  workspaceId: string;
  memberIds: string[];
  board: {
    create: boolean;
  };
  member: {
    invite: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isAdmin: boolean;
}
