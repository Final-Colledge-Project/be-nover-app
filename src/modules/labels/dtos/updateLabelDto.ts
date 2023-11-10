import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export default class UpdateLabelDto {
  constructor(name: string, color: string){
    this.name = name
    this.color = color
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'Name must be at least 2 characters long',
  })
  @MaxLength(20, {
    message: 'Name must be at most 20 characters long',
  })
  public name: string;
  @IsNotEmpty()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color',
  })
  public color: string;
}