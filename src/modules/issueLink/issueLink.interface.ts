export default interface IIssueLink {
  _id: string;
  boardId: string;
  name: string;
  direction: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}