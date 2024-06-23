import { IsEmail, IsMongoId, IsNotEmpty } from "class-validator";

export default class JoinGroupDto {
  constructor(emailUser: string, permissionId: string) {
    this.emailUser = emailUser;
    this.permissionId = permissionId;
  }
  @IsNotEmpty()
  @IsEmail()
  public emailUser: string;
  @IsNotEmpty()
  @IsMongoId()
  public permissionId: string;
}
