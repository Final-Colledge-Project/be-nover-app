import {
  IsDefined,
  IsHexColor,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export default class CreateLabelDto {
  constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: "Name must be at least 3 characters long",
  })
  @MaxLength(50, {
    message: "Name must be at most 50 characters long",
  })
  @IsDefined()
  public name: string;
  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  public color: string;
}
