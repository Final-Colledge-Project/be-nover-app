export default interface IEpic {
  _id: string;
  boardId: string;
  name: string;
  description: string;
  startDate: Date;
  dueDate: Date;
  cardOrderIds: string[];
  color: string;
  preEpicId: string;
  nextEpicId: string;
  columnId: string;
  assigneeId: string;
  labelId: string;
  priorityId: string;
  comments: IComment[];
  attachments: IAttachment[];
  issueTypeId: string;
}

export interface IComment {
  user: string;
  email: string;
  avatar: string;
  displayName: string;
  content: string;
  createdAt: Date;
}
export interface IAttachment {
  fileName: string;
  fileType: string;
  fileUrl: string;
  createAt: Date;
}
