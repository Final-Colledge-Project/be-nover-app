import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export default class CreatePriorityDto {
  constructor(name: string, description: string, color: string) {
    this.name = name;
    this.description = description;
    this.color = color;
  }
  @IsString()
  @IsNotEmpty()
  public name: string;
  @IsString()
  @IsOptional()
  public description: string;
  @IsString()
  @IsNotEmpty()
  public color: string;
}
