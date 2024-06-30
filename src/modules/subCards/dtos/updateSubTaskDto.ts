import { SUBTASK_STATUS, formatDate } from "@core/utils";
import { Transform, TransformFnParams } from "class-transformer";
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, Min, MinLength } from "class-validator";
export default class UpdateSubTaskDto {
  constructor(
    name: string,
    status: string,
    assignedTo: string,
    dueDate: Date,
  ) {
    this.name = name;
    this.status = status;
    this.assignedTo = assignedTo;
    this.dueDate = dueDate;
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'Title must be at least 2 characters long',
  })
  @MaxLength(50, {
    message: 'Title must be at most 50 characters long',
  })
  public name: string;
  @IsEnum([SUBTASK_STATUS.todo, SUBTASK_STATUS.inprogress, SUBTASK_STATUS.completed, SUBTASK_STATUS.cancel])
  public status: string;
  @IsString()
  public assignedTo: string;
  @Transform(({value} : TransformFnParams) => formatDate(value) )
  @IsDateString()
  public dueDate: Date;
}