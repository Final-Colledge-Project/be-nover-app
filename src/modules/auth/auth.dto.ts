import { IsEmail, IsNotEmpty } from 'class-validator';

export default class AuthDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
  @IsNotEmpty()
  public password: string;

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }
}
