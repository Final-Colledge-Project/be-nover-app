export default interface INotification {
  senderId: string;
  type: IType;
  message: string;
  targetType: string;
  contextUrl: string;
  receiverId: string;
  isRead: boolean;
  isTrash: boolean;
  isActive: boolean;
  createAt: Date;
  updatedAt: Date;
}

export interface ISender {
  id: string;
  avatar: string | null;
  name: string;
}

export interface IType {
  name: string | null;
  category: string;
}
