import { SPRINT_STATUS, formatDate } from "@core/utils";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export default class UpdateSprintDto {
  constructor(
    name: string,
    duration: number,
    startDate: Date,
    endDate: Date,
    goal: string,
    status: string
  ) {
    this.name = name;
    this.duration = duration;
    this.startDate = startDate;
    this.endDate = endDate;
    this.goal = goal;
    this.status = status;
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

  @IsOptional()
  @IsNumber()
  @IsEnum([0, 1, 2, 3, 4])
  public duration: number;
  @Transform(({ value }: TransformFnParams) => formatDate(value))
  @IsDateString()
  public startDate: Date;
  @Transform(({ value }: TransformFnParams) => formatDate(value))
  @IsDateString()
  public endDate: Date;
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(200, {
    message: "Title must be at most 200 characters long",
  })
  public goal: string;
  @IsEnum(Object.values(SPRINT_STATUS), {
    message: `Status must be one of ${Object.values(SPRINT_STATUS).join(", ")}`,
  })
  public status: string;
}
