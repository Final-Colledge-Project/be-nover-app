import { IsArray, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
export default class UpdateColumnDto {
  constructor(title: string, cardOrderIds: string[]) {
    this.title = title,
    this.cardOrderIds = cardOrderIds
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'Title must be at least 2 characters long',
  })
  @MaxLength(30, {
    message: 'Title must be at most 30 characters long',
  })
  public title: string;
  @IsNotEmpty()
  @IsArray()
  public cardOrderIds: string[];
}