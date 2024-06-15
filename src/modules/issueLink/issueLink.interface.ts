export default interface IIssueLink {
  _id: string;
  boardId: string;
  sourceIssue: ILinkedIssue;
  targetIssue: ILinkedIssue[];
  linkIssueTypeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILinkedIssue {
  issueId: string;
  issueModel: string;
  direction: string;
}

export interface ICommonIssue {
  id: string;
  name: string;
  model: string;
}
