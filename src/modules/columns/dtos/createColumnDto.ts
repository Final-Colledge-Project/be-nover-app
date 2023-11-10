import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
export default class CreateColumnDto {
  constructor(title: string) {
    this.title = title
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
}