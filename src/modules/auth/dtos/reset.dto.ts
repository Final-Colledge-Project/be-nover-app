import { IsEmail, IsNotEmpty } from 'class-validator';

export default class ResetDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
  @IsNotEmpty()
  public otp: string;
  @IsNotEmpty()
  public newPassword: string;

  constructor(email: string, otp: string, newPassword: string, confirmPassword: string) {
    (this.email = email), (this.otp = otp), (this.newPassword = newPassword);
  }
}
