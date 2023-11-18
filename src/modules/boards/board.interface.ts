export default interface IBoard {
  _id: string;
  title: string;
  description: string;
  columnOrderIds: string[];
  type: string;
  teamWorkspaceId: string;
  ownerIds: string[];
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isDestroyed: boolean;
}


