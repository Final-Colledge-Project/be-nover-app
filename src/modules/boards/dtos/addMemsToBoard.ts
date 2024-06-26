import { MODE_ACCESS } from "@core/utils";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export interface IAddMem {
  memberId: string;
  permissionId: string;
}

export default class AddMemsToBoardDto {
  constructor(members: IAddMem[]) {
    this.members = members;
  }
  @IsNotEmpty()
  @IsArray()
  public members: IAddMem[];
}
