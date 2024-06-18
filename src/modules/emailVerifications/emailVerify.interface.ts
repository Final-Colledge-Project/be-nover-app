export default interface IEmailVerify {
  _id: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}
