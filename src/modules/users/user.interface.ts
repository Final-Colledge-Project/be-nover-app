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
  verify: boolean;
  refreshToken: string[];
  profileLogin: IProfileLogin;
  active: boolean;
}

interface IProfileLogin {
  id: string;
  provider: string;
  tokenLogin: string;
}
