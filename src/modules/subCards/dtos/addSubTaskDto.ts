import { SUBTASK_STATUS, formatDate } from "@core/utils";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
export default class AddSubTaskDto {
  constructor(
    cardId: string,
    name: string,
    status: string,
    assignedTo: string,
    dueDate: Date,
    startDate: Date,
    labelId: string,
    priorityId: string,
    columnId: string,
    issueTypeId: string
  ) {
    this.cardId = cardId;
    this.name = name;
    this.status = status;
    this.assignedTo = assignedTo;
    this.dueDate = dueDate;
    this.startDate = startDate;
    this.labelId = labelId;
    this.priorityId = priorityId;
    this.columnId = columnId;
    this.issueTypeId = issueTypeId;
  }
  @IsNotEmpty()
  @IsString()
  public cardId: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(50, {
    message: "Title must be at most 50 characters long",
  })
  public name: string;
  @IsEnum([
    SUBTASK_STATUS.todo,
    SUBTASK_STATUS.inprogress,
    SUBTASK_STATUS.completed,
    SUBTASK_STATUS.cancel,
  ])
  public status: string;
  @IsString()
  public assignedTo: string;
  @Transform(({ value }: TransformFnParams) => formatDate(value))
  @IsDateString()
  public startDate: Date;
  @Transform(({ value }: TransformFnParams) => formatDate(value))
  @IsDateString()
  public dueDate: Date;
  @IsString()
  @IsOptional()
  public labelId: string;
  @IsString()
  @IsOptional()
  public priorityId: string;
  @IsOptional()
  @IsString()
  public columnId: string;
  @IsString()
  @IsOptional()
  public issueTypeId: string;
}
