import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

export default class CreateIssueTypeDto {
  constructor(
    name: string,
    description: string,
    icon: string,
    hierarchy: number
  ) {
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.hierarchy = hierarchy;
  }
  @IsString()
  @IsNotEmpty()
  public name: string;
  @IsString()
  @IsOptional()
  public description: string;
  @IsString()
  @IsOptional()
  public icon: string;
  @IsNotEmpty()
  @IsEnum([1, 2, 3])
  public hierarchy: number;
}
