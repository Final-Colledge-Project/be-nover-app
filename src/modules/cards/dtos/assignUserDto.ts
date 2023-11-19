import { IsEmail, IsNotEmpty, IsString, MaxLength, Min, MinLength } from "class-validator";
export default class assignUserDto {
  constructor(
    email: string
  ) {
    this.email = email;
  }
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}