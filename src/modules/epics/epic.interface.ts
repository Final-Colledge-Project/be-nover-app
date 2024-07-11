export default interface IEpic {
  _id: string;
  boardId: string;
  name: string;
  description: string;
  startDate: Date;
  dueDate: Date;
  cardOrderIds: string[];
  color: string;
  columnId: string;
  assigneeId: string;
  labelId: string;
  priorityId: string;
  comments: IComment[];
  attachments: IAttachment[];
  creatorId: string;
  issueTypeId: string;
}
export interface IComment {
  _id?: string;
  userId: string;
  content: string;
  icon: string;
  edited: boolean;
  likeIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
export interface IAttachment {
  fileName: string;
  fileType: string;
  fileUrl: string;
  createAt: Date;
}
