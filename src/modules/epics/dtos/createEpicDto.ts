import { formatDate } from "@core/utils";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
export default class CreateEpicDto {
  constructor(
    name: string,
    description: string,
    startDate: Date,
    dueDate: Date,
    color: string,
    labelId: string,
    assigneeId: string,
    issueTypeId: string,
    columnId: string
  ) {
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.dueDate = dueDate;
    this.color = color;
    this.labelId = labelId;
    this.assigneeId = assigneeId;
    this.issueTypeId = issueTypeId;
    this.columnId = columnId;
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(50, {
    message: "Title must be at most 30 characters long",
  })
  public name: string;
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(50, {
    message: "Title must be at most 30 characters long",
  })
  public description: string;
  @Transform(({ value }: TransformFnParams) => formatDate(value))
  @IsDateString()
  public startDate: Date;
  @Transform(({ value }: TransformFnParams) => formatDate(value))
  @IsDateString()
  public dueDate: Date;
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Color must be a valid hex color",
  })
  public color: string;
  @IsOptional()
  @IsString()
  public labelId: string;
  @IsOptional()
  @IsString()
  public assigneeId: string;
  @IsOptional()
  @IsString()
  public issueTypeId: string;
  @IsString()
  public columnId: string;
}
