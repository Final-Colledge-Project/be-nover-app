export default interface ITaskLog {
  _id: string;
  userId: string;
  target: string;
  msg: string;
  oldVal: string;
  newVal: string;
  createdAt: Date;
  updatedAt: Date;
}