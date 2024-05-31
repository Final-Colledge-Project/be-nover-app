import { formatDate } from "@core/utils";
import { Transform, TransformFnParams } from "class-transformer";
import { IsDateString, IsNotEmpty, IsString, MaxLength, Min, MinLength } from "class-validator";
export default class CreateCardDto {
  constructor(
    columnId: string,
    title: string,
    description: string,
    labelId: string,
    priorityId: string,
  ) {
    this.columnId = columnId;
    this.title = title;
    this.description = description;
    this.labelId = labelId;
    this.priorityId = priorityId;
  }
  @IsNotEmpty()
  @IsString()
  public columnId: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'Title must be at least 2 characters long',
  })
  @MaxLength(50, {
    message: 'Title must be at most 50 characters long',
  })
  public title: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'Description must be at least 2 characters long',
  })
  @MaxLength(200, {
    message: 'Description must be at most 200 characters long',
  })
  public description;
  @Transform(({value} : TransformFnParams) => formatDate(value) )
  @IsString()
  public labelId: string;
  @IsString()
  public priorityId: string;
}