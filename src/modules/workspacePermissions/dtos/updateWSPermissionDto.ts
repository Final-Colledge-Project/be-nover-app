import {
  IsArray,
  IsHexColor,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export default class UpdateWSPermissionDto {
  constructor(
    name: string,
    description: string,
    color: string,
    memberIds: string[],
    board: { create: boolean },
    member: { invite: boolean }
  ) {
    this.name = name;
    this.description = description;
    this.color = color;
    this.memberIds = memberIds;
    this.member = member;
    this.board = board;
  }
  @IsString()
  @MinLength(2, {
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(50, {
    message: "Title must be at most 50 characters long",
  })
  public name: string;
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: "Description must be at least 2 characters long",
  })
  @MaxLength(255, {
    message: "Description must be at most 255 characters long",
  })
  public description: string;
  @IsOptional()
  @IsHexColor()
  public color: string;
  @IsArray()
  public memberIds?: string[];
  @IsOptional()
  @IsObject()
  public board: { create: boolean };
  @IsObject()
  @IsOptional()
  public member: { invite: boolean };
}
