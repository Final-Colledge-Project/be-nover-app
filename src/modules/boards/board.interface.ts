export default interface IBoard {
  _id: string;
  title: string;
  key: string;
  template: string;
  description: string;
  cover: string;
  columnOrderIds: string[];
  type: string;
  teamWorkspaceId: string;
  ownerIds: string[];
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  isActive: boolean;
  defaultAssigneeId: string;
  initColumnId: string;
  nextAutoIncrement: number;
  workingDays: number[];
  initEpicId: string;
  initTaskId: string;
  initSubTaskId: string;
}

export interface ICommonIssue {
  _id: string;
  name: string;
  issueTag: string;
  issueType: string;
  type: string;
}
