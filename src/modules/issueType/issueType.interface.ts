export default interface IIssueType {
  _id: string;
  boardId: string;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  hierarchy: number;
}
