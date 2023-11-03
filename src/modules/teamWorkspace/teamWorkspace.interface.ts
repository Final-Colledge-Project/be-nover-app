export default interface ITeamWorkspace {
  _id: string;
  name: string;
  workspaceAdmin: string;
  memberList: string[];
  createdAt: Date;
  active: boolean;
}