import {
  IsArray,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export default class AddWSPermissionDto {
  constructor(
    name: string,
    description: string,
    color: string,
    memberIds: string[],
    board: { create: boolean },
    member: { view: boolean; invite: boolean }
  ) {
    this.name = name;
    this.description = description;
    this.color = color;
    this.memberIds = memberIds;
    this.member = member;
    this.board = board;
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
  @IsOptional()
  public board: { create: boolean };
  @IsOptional()
  public member: { view: boolean; invite: boolean };
}
