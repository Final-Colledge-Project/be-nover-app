import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
export default class CreateColumnDto {
  constructor(title: string, columnStatusId: string) {
    this.title = title;
    this.columnStatusId = columnStatusId;
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(30, {
    message: "Title must be at most 30 characters long",
  })
  public title: string;
  @IsOptional()
  @IsString()
  public columnStatusId: string;
}
