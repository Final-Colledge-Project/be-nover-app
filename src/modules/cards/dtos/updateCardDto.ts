import { ILinkedIssue } from "@modules/issueLinks/issueLink.interface";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export default class UpdateCardDto {
  constructor(
    columnId: string,
    title: string,
    description: string,
    labelId: string,
    priorityId: string,
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
  @IsOptional()
  @IsString()
  public sprintId: string;
  @IsOptional()
  @IsString()
  public epicId: string;
  @IsOptional()
  @IsString()
  public issueTypeId: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public storyPoint: number;
}

export interface IIssueLinkPayload {
  sourceIssueId: string;
  sourceIssueModel: string;
  targetIssue: ILinkedIssue[];
  linkIssueTypeId: string;
}
