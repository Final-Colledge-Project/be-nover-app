import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsString,
  isMongoId,
} from "class-validator";
export default class UpdateCommentDto {
  constructor(
    content: string,
    icon: string,
    commentId: string,
    edited: boolean,
    likeIds: string[]
  ) {
    this.content = content;
    this.icon = icon;
    this.commentId = commentId;
    this.edited = edited;
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

  @IsBoolean()
  public edited: boolean;

  @IsArray()
  public likeIds: string[];
}
