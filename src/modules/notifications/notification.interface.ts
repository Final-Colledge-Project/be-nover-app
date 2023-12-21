export default interface INotification {
  sender: ISender;
  type: string;
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