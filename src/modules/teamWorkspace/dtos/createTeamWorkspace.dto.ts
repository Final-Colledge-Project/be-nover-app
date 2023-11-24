import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export default class CreateTeamWorkspaceDto {
  constructor(name: string, superAdminWorkspaceId: string) {
    this.name = name;
    this.superAdminWorkspaceId = superAdminWorkspaceId;
  }
  @IsNotEmpty()
  @MinLength(2, {
    message: 'Name must be at least 2 characters long',
  })
  @MaxLength(30, {
    message: 'Name must be at most 30 characters long',
  })
  public name: string;
  @IsString()
  public superAdminWorkspaceId: string;
}