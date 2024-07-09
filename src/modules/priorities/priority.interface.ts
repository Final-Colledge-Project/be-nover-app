export default interface IPriority {
  _id: string;
  boardId: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  toObject?: any;
}
