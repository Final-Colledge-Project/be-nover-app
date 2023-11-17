import { IsEmail, IsNotEmpty } from 'class-validator';

export default class JoinGroupDto {
  @IsNotEmpty()
  @IsEmail()
  public emailUser: string
  constructor(emailUser: string) {
    this.emailUser = emailUser
  }
}
