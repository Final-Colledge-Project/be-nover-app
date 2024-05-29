export default interface IBoard {
  _id: string;
  title: string;
  key: string;
  template: string;
  description: string;
  cover: string;
  columnOrderIds: string[];
  type: string;
  teamWorkspaceId: string;
  ownerIds: string[];
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  isActive: boolean;
  defaultAssignee: string;
}

export interface IBoardAdmin {
  user: string;
  role: string;
}
