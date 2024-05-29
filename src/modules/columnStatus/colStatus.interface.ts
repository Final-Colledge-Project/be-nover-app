export default interface IColumnStatus {
  _id: string;
  name: string;
  description: string;
  color: string;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
  isResolved: boolean;
  isActive: boolean;
}
