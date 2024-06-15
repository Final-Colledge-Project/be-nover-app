import { IsOptional, IsString } from "class-validator";

export default class UpdateIssueLinkTypeDto {
  constructor(name: string, outwardName: string, inwardName: string) {
    this.name = name;
    this.outwardName = outwardName;
    this.inwardName = inwardName;
  }
  @IsString()
  @IsOptional()
  public name: string;
  @IsString()
  @IsOptional()
  public inwardName: string;
  @IsString()
  @IsOptional()
  public outwardName: string;
}
