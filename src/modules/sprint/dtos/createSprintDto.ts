import { SPRINT_DURATION, formatDate } from "@core/utils";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export default class CreateSprintDto {
  constructor(
    name: string,
    duration: string,
    startDate: Date,
    endDate: Date,
    goal: string
  ) {
    this.name = name;
    this.duration = duration;
    this.startDate = startDate;
    this.endDate = endDate;
    this.goal = goal;
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
  @IsString()
  @IsEnum([
    SPRINT_DURATION.oneWeek,
    SPRINT_DURATION.twoWeeks,
    SPRINT_DURATION.threeWeeks,
    SPRINT_DURATION.fourWeeks,
    SPRINT_DURATION.custom,
  ])
  public duration: string;
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
}
