export default interface ICard {
  _id: string;
  boardId: string;
  columnId: string;
  cardId: string;
  title: string;
  description: string;
  cover: string;
  startDate: Date;
  dueDate: Date;
  memberIds: string[];
  comments: IComment[];
  subTasks: string[];
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
  reporterId: string;
  labelId: string;
  priority: string;
  isOverdue: boolean;
  isActive: boolean;
}
export interface IComment {
  user: string;
  email: string,
  avatar: string,
  displayName: string,
  content: string,
  createdAt: Date,
}
export interface IAttachment {
  fileName: string,
  fileType: string,
  fileUrl: string,
  createAt: Date,
}

