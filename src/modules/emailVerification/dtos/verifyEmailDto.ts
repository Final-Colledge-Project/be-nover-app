export default class VerifyEmailDto {
  public email: string;
  public otp: string;

  constructor(model: VerifyEmailDto) {
    this.email = model.email;
    this.otp = model.otp;
  }
}