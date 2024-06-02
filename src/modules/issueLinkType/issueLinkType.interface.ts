export default interface IIssueLinkType {
  _id: string;
  boardId: string;
  name: string;
  inwardName: string;
  outwardName: string;
  direction: string;
  createdAt: Date;
  updatedAt: Date;
}
