import { MODE_ACCESS, formatDate } from "@core/utils";
import { Transform, TransformFnParams } from "class-transformer";
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
export default class UpdateBoardDto{
  constructor(title: string, description: string, columnOrderIds: string[], type: string, dueDate: Date) {
    this.title = title,
    this.description = description,
    this.columnOrderIds = columnOrderIds,
    this.type = type,
    this.dueDate = dueDate
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: 'Title must be at least 3 characters long',
  })
  @MaxLength(30, {
    message: 'Title must be at most 30 characters long',
  })
  public title: string;
  @IsNotEmpty()
  @MinLength(2, {
    message: 'Title must be at least 2 characters long',
  })
  @MaxLength(100, {
    message: 'Title must be at most 100 characters long',
  })
  public description: string;
  @IsNotEmpty()
  @IsArray()
  public columnOrderIds: string[];
  @IsNotEmpty()
  @IsString()
  @IsEnum([MODE_ACCESS.private, MODE_ACCESS.public])
  public type: string;
  @Transform(({value} : TransformFnParams) => formatDate(value) )
  @IsDateString()
  public dueDate: Date;
}