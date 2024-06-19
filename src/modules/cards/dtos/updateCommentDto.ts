import { IsMongoId, IsNotEmpty, IsString, isMongoId } from "class-validator";
export default class UpdateCommentDto {
  constructor(content: string, icon: string, commentId: string) {
    this.content = content;
    this.icon = icon;
    this.commentId = commentId;
  }
  @IsNotEmpty()
  @IsString()
  public content: string;

  @IsNotEmpty()
  @IsString()
  public icon: string;

  @IsNotEmpty()
  @IsMongoId()
  public commentId: string;
}
