import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export default class VerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
  @IsNotEmpty()
  public otp: string;

  constructor(model: VerifyOtpDto) {
    this.email = model.email;
    this.otp = model.otp;
  }
}
