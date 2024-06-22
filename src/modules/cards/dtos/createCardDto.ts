import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export interface IIssueLinkPayload {
  targetIssueId: string;
  linkIssueTypeId: string;
}
export default class CreateCardDto {
  constructor(
    columnId: string,
    title: string,
    description: string,
    labelId: string,
    priorityId: string,
    reporterId: string,
    assigneeId: string,
    sprintId: string,
    epicId: string,
    issueTypeId: string,
    storyPoint: number
  ) {
    this.columnId = columnId;
    this.title = title;
    this.description = description;
    this.labelId = labelId;
    this.priorityId = priorityId;
    this.reporterId = reporterId;
    this.assigneeId = assigneeId;
    this.sprintId = sprintId;
    this.epicId = epicId;
    this.issueTypeId = issueTypeId;
    this.storyPoint = storyPoint;
  }
  @IsOptional()
  @IsString()
  public columnId: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(50, {
    message: "Title must be at most 50 characters long",
  })
  public title: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: "Description must be at least 2 characters long",
  })
  @MaxLength(200, {
    message: "Description must be at most 200 characters long",
  })
  public description;
  @IsString()
  @IsOptional()
  public labelId: string;
  @IsString()
  @IsOptional()
  public priorityId: string;
  @IsString()
  @IsNotEmpty()
  public reporterId: string;
  @IsOptional()
  @IsString()
  public assigneeId: string;
  @IsOptional()
  @IsString()
  public sprintId: string;
  @IsOptional()
  @IsString()
  public epicId: string;
  @IsNotEmpty()
  @IsString()
  public issueTypeId: string;
  @IsNotEmpty()
  @IsNumber()
  public storyPoint: number;
}
