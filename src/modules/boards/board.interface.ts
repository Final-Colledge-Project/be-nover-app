export default interface IBoard {
  _id: string;
  title: string;
  description: string;
  type: string;
  teamWorkspaceId: string;
  ownerIds: string[];
  memberIds: string[];
  columnIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isDestroyed: boolean;
}

