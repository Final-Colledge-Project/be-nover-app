import { MODE_ACCESS } from "@core/utils";
import { IsArray, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export default class AddMemsToBoardDto {
  constructor(memberIds: string[]){
    this.memberIds = memberIds
  }
  @IsNotEmpty()
  @IsArray()
  public memberIds: string[];
}