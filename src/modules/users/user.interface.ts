export default interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  birthDate: Date;
  address: string;
  avatar: string;
  createdAt: Date;
  passwordChangedAt: Date;
  role: string;
  verify: boolean,
  active: boolean;
}