export default interface ILabel {
  toObject: any;
  _id: string;
  name: string;
  color: string;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
