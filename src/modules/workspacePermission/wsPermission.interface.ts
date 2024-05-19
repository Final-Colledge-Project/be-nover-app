export default interface IWorkspacePermission {
  _id: string;
  name: string;
  description: string;
  color: string;
  workspaceId: string;
  memberIds: string[];
  board: {
    viewAll: boolean;
    create: boolean;
  };
  member: {
    viewAll: boolean;
    invite: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isAdmin: boolean;
  isWSViewer: boolean;
}
