import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export default class CreateTeamWorkspaceDto {
  @IsNotEmpty()
  @MinLength(2, {
    message: 'Name must be at least 2 characters long'
  })
  @MaxLength(20, {
    message: 'Name must be at most 20 characters long'
  })
  public name: string
  @IsString()
  public superAdminWorkspaceId: string
  constructor(name: string, superAdminWorkspaceId: string) {
    this.name = name;
    this.superAdminWorkspaceId = superAdminWorkspaceId;
  }
}
