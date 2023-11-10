import { IsNotEmpty, IsString, MaxLength, Min, MinLength } from "class-validator";
export default class CreateCardDto {
  constructor(
    columnId: string,
    title: string,
    description: string,
    cover: string,
    startDate: Date,
    dueDate: Date,
    labelId: string,
    priorityId: string,
  ) {
    this.columnId = columnId;
    this.title = title;
    this.description = description;
    this.cover = cover;
    this.startDate = startDate;
    this.dueDate = dueDate;
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
  @MaxLength(20, {
    message: 'Title must be at most 20 characters long',
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
  @IsString()
  public cover: string;
  public startDate: Date;
  public dueDate: Date;
  @IsString()
  public labelId: string;
  @IsString()
  public priorityId: string;
}