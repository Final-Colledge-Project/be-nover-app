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

export interface IGeneralIssue {
  _id: string;
  boardId: string;
  hierarchy: number;
  taskId: string;
  name: string;
  description: string;
  issueType: IIssueTypeCol;
  status: IStatusCol;
  assignee: IAssigneeCol;
  storyPoint?: number;
  sprint?: ISprintCol;
  startDate: string;
  dueDate: string;
  label: ILabelCol;
  priority: IPriorityCol;
  resolvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIssueTypeCol {
  _id: string;
  name: string;
  icon: string;
}

export interface IStatusCol {
  _id: string;
  name: string;
  color: string;
}

export interface IAssigneeCol {
  _id: string;
  name: string;
  avatar: string;
}

export interface ISprintCol {
  _id: string;
  name: string;
}

export interface ILabelCol {
  _id: string;
  name: string;
  color: string;
}

export interface IPriorityCol {
  _id: string;
  name: string;
  color: string;
}
