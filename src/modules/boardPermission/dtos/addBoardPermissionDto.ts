import {
  IsArray,
  IsHexColor,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export default class AddBoardPermissionDto {
  constructor(
    name: string,
    description: string,
    color: string,
    memberIds: string[],
    column: { create: boolean; update: boolean; delete: boolean },
    card: { all: boolean },
    member: { invite: boolean },
    issueType: { create: boolean; update: boolean; delete: boolean },
    priority: { create: boolean; update: boolean; delete: boolean },
    label: { create: boolean; update: boolean; delete: boolean },
    sprint: { create: boolean; update: boolean; delete: boolean }
  ) {
    this.name = name;
    this.description = description;
    this.color = color;
    this.memberIds = memberIds;
    this.column = column;
    this.card = card;
    this.member = member;
    this.issueType = issueType;
    this.priority = priority;
    this.label = label;
    this.sprint = sprint;
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
  @IsString()
  @MinLength(2, {
    message: "Description must be at least 2 characters long",
  })
  @MaxLength(255, {
    message: "Description must be at most 255 characters long",
  })
  public description: string;
  @IsHexColor()
  public color: string;
  @IsArray()
  public memberIds: string[];
  @IsObject()
  public column: { create: boolean; update: boolean; delete: boolean };
  @IsObject()
  public card: { all: boolean };
  @IsObject()
  public member: { invite: boolean };
  @IsObject()
  public issueType: { create: boolean; update: boolean; delete: boolean };
  @IsObject()
  public priority: { create: boolean; update: boolean; delete: boolean };
  @IsObject()
  public label: { create: boolean; update: boolean; delete: boolean };
  @IsObject()
  public sprint: { create: boolean; update: boolean; delete: boolean };
}
