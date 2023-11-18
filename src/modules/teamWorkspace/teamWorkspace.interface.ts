export default interface ITeamWorkspace {
  _id: string;
  name: string;
  workspaceAdmins: IWorkspaceAdmin[];
  workspaceMembers: IMember[];
  createdAt: Date;
  active: boolean;
}
export interface IWorkspaceAdmin {
  user: string;
  role: string;
}
export interface IMember {
  user: string;
  joinDate: Date;
}