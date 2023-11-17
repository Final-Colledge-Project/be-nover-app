import {  IsEmail, IsNotEmpty, Length, MaxLength, MinLength } from "class-validator";

export default class RegisterDto {
  constructor(firstName: string, lastName: string, email: string, password: string, phone: string, birthDate: Date, address: string){
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.password = password
    this.phone = phone
    this.birthDate = birthDate
    this.address = address
  }
  
  @IsNotEmpty()
  @MinLength(2, {
    message: 'First name must be at least 2 characters long',
  })
  @MaxLength(20, {
    message: 'First name must be at most 20 characters long',
  })
  public firstName: string;
  @IsNotEmpty()
  @MinLength(2, {
    message: 'Last name must be at least 2 characters long',
  })
  @MaxLength(20, {
    message: 'Last name must be at most 20 characters long',
  })
  public lastName: string;
  @IsNotEmpty()
  @IsEmail()
  public email: string;
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  public password: string;
  @IsNotEmpty()
  @Length(10, 10, {
    message: 'Phone must be at least 10 characters long',
  })
  public phone: string;
  @IsNotEmpty()
  public birthDate: Date;
  @IsNotEmpty()
  public address: string;
}