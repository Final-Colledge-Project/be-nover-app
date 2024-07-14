import { IsNotEmpty, IsString } from "class-validator";
export default class AddCommentDto {
  constructor(content: string, icon: string) {
    this.content = content;
    this.icon = icon;
  }
  @IsNotEmpty()
  @IsString()
  public content: string;

  @IsNotEmpty()
  @IsString()
  public icon: string;
}
