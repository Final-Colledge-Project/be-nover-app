import {
  IsBoolean,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export default class CreateColumnStatusDto {
  constructor(
    name: string,
    description: string,
    color: string,
    isResolved: boolean
  ) {
    this.name = name;
    this.description = description;
    this.color = color;
    this.isResolved = isResolved;
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(30, { message: "Name must be at most 30 characters long" })
  public name: string;
  @IsOptional()
  @IsString()
  @MinLength(3, { message: "Description must be at least 3 characters long" })
  @MaxLength(300, {
    message: "Description must be at most 300 characters long",
  })
  public description: string;
  @IsOptional()
  @IsString()
  @IsHexColor()
  public color: string;
  @IsOptional()
  @IsBoolean()
  public isResolved: boolean;
}
