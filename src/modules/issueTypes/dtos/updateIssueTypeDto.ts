import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

export default class UpdateIssueTypeDto {
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
  @IsNotEmpty()
  public icon: string;
  @IsNotEmpty()
  @IsNumber()
  @IsEnum([1, 2, 3])
  public hierarchy: number;
}
