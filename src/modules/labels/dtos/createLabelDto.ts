import { IsDefined, IsHexColor, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export default class CreateLabelDto {
  constructor(name: string, color: string, boardId: string){
    this.name = name
    this.color = color
    this.boardId = boardId
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'Name must be at least 2 characters long',
  })
  @MaxLength(20, {
    message: 'Name must be at most 20 characters long',
  })
  @IsDefined()
  public name: string;
  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  public color: string;
  @IsNotEmpty()
  @IsString()
  public boardId: string;
}