import { IsNotEmpty, MinLength } from "class-validator";

export default class ChangePasswordDto {
  constructor(currentPassword: string, newPassword: string){
    this.currentPassword = currentPassword
    this.newPassword = newPassword
  }
  
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  public currentPassword: string;
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  public newPassword: string;
  
}