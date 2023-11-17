import { IsEmail, IsNotEmpty } from "class-validator";

export default class SendOtpDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
  @IsNotEmpty()
  public subject: string;
  @IsNotEmpty()
  public message: string;
  @IsNotEmpty()
  public duration: number;

  constructor(email: string, subject: string, message: string, duration: number) {
    this.email = email;
    this.subject = subject;
    this.message = message;
    this.duration = duration;
  }
}