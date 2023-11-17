export default interface IOtp {
  _id: string
  email: string
  otp: string
  createdAt: Date
  expireAt: Date
};
