import {
  IsArray,
  IsHexColor,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export default class AddDirectionDto {
  constructor(sourceColumnId: string, targetColumnId: string, name: string) {
    this.sourceColumnId = sourceColumnId;
    this.targetColumnId = targetColumnId;
    this.name = name;
  }
  @IsString()
  @MinLength(2, {
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(50, {
    message: "Title must be at most 50 characters long",
  })
  public name: string;
  @IsString()
  @IsMongoId()
  public sourceColumnId: string;
  @IsString()
  @IsMongoId()
  public targetColumnId: string;
}
