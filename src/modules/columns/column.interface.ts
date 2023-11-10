export default interface IColumn {
  _id: string;
  title: string;
  boardId: string;
  cardOrderIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}