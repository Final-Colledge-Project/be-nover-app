export default interface IIssueLink {
  _id: string;
  sourceIssue: ILinkedIssue;
  targetIssue: ILinkedIssue[];
  linkIssueTypeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILinkedIssue {
  issueId: string;
  issueModel: string;
}
