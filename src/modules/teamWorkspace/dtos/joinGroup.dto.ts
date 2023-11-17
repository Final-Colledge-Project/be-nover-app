import { IsEmail, IsNotEmpty } from "class-validator";

export default class JoinGroupDto {
  constructor(emailUser: string) {
    this.emailUser = emailUser;
  }
  @IsNotEmpty()
  @IsEmail()
  public emailUser: string;
}