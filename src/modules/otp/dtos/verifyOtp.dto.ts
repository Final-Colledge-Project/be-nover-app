import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export default class VerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
  @IsNotEmpty()
  public otp: string;

  constructor(email: string, otp: string) {
    this.email = email;
    this.otp = otp;
  }
}
