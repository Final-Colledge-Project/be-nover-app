import { IsArray, IsMongoId, IsNotEmpty, IsString } from "class-validator";
export default class UpdateCommentDto {
  constructor(
    content: string,
    icon: string,
    commentId: string,
    likeIds: string[]
  ) {
    this.content = content;
    this.icon = icon;
    this.commentId = commentId;
    this.likeIds = likeIds;
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

  @IsArray()
  public likeIds: string[];
}
