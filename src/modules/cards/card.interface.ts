import { IIssueLink } from "@modules/issueLink";

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
  issueLinks: IIssueLink[];
  watcherIds: string[];
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
