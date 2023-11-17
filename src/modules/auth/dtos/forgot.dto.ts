import { IsNotEmpty } from 'class-validator';

export default class ForgotDto {
  @IsNotEmpty()
  public email: string;

  constructor(email: string) {
    this.email = email
  }
}
