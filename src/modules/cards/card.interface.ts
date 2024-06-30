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
  subTaskIds: string[];
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
  reporterId: string;
  labelId: string;
  priorityId: string;
  isActive: boolean;
  epicId: string;
  sprintId: string;
  deletedAt: Date;
  resolvedAt: Date;
  storyPoint: number;
  watcherIds: string[];
  issueTypeId: string;
}
export interface IComment {
  _id?: string;
  userId: string;
  content: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IAttachment {
  fileName: string;
  fileType: string;
  fileUrl: string;
  createAt: Date;
}
