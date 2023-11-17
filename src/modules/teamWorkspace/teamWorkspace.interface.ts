export interface IWorkspaceAdmin {
  user: string;
  role: string;
}
export interface IMember {
  user: string;
  joinDate: Date;
}
export interface IInvitedMember {
  user: string;
  requestDate: Date;
  status: string;
}
export default interface ITeamWorkspace {
  _id: string;
  name: string;
  workspaceAdmins: IWorkspaceAdmin[];
  workspaceMembers: IMember[];
  createdAt: Date;
  invitedMembers: IInvitedMember[];
  active: boolean;
}
