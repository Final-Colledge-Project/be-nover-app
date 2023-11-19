import { IsBoolean, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export default class UpdateCardDto {
  constructor(
    title: string,
    description: string,
    cover: string,
    dueDate: Date,
    labelId: string,
    priorityId: string,
    isDone: boolean,
  ) {
    this.title = title;
    this.description = description;
    this.cover = cover;
    this.dueDate = dueDate;
    this.labelId = labelId;
    this.priorityId = priorityId;
    this.isDone = isDone;
  }
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
  public dueDate: Date;
  @IsString()
  public labelId: string;
  @IsString()
  public priorityId: string;
  @IsNotEmpty()
  @IsBoolean()
  public isDone: boolean;
}