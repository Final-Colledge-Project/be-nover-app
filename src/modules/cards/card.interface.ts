export default interface ICard {
  _id: string;
  boardId: string;
  columnId: string;
  cardId: string;
  title: string;
  description: string;
  cover: string;
  memberIds: string[];
  comments: IComment[];
  subTasks: string[];
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
  reporterId: string;
  labelId: string;
  priority: string;
  isActive: boolean;
  epicId: string;
  sprintId: string;
  deletedAt: Date;
  resolvedAt: Date;
  storyPoint: number;
  issueLinks: string[];
  taskLogs: string[];
  watchers: string[];
  issueType: string;
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


