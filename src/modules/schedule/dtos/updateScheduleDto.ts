import { SCHEDULE_TYPE } from "@core/utils";
import {
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
export default class UpdateScheduleDto {
  constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { 
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(50, {
    message: "Title must be at most 50 characters long",
  })
  public name: string;
  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  public color: string;
}
