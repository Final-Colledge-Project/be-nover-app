export default class VerifyOtpDto {
  public email: string;
  public otp: string;

  constructor(model: VerifyOtpDto) {
    this.email = model.email;
    this.otp = model.otp;
  }
}
