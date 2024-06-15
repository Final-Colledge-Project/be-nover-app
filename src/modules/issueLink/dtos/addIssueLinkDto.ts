import { DIRECTION_TYPE } from "@core/utils";
import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";

export default class AddIssueLinkDto {
  constructor(
    source: string,
    target: string,
    issueLinkTypeId: string,
    direction: string
  ) {
    this.source = source;
    this.target = target;
    this.issueLinkTypeId = issueLinkTypeId;
    this.direction = direction;
  }
  @IsNotEmpty()
  @IsString()
  public source: string;
  @IsNotEmpty()
  @IsString()
  public target: string;
  @IsNotEmpty()
  public issueLinkTypeId: string;
  @IsEnum(Object.values(DIRECTION_TYPE))
  public direction: string;
}

export interface IssueDto {
  id: string;
  model: string;
}
