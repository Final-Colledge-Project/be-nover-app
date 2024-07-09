export default interface IIssueType {
  toObject(): any;
  _id: string;
  boardId: string;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  hierarchy: number;
  canDelete?: boolean;
}
