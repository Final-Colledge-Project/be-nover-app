export default interface IIssueLinkType {
  toObject: any;
  _id: string;
  boardId: string;
  name: string;
  inwardName: string;
  outwardName: string;
  createdAt: Date;
  updatedAt: Date;
}
