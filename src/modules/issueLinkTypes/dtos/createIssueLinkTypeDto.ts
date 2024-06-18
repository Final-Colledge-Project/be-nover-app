import { IsNotEmpty, IsString } from "class-validator";

export default class CreateIssueLinkTypeDto {
  constructor(name: string, outwardName: string, inwardName: string) {
    this.name = name;
    this.outwardName = outwardName;
    this.inwardName = inwardName;
  }
  @IsString()
  @IsNotEmpty()
  public name: string;
  @IsString()
  @IsNotEmpty()
  public inwardName: string;
  @IsString()
  @IsNotEmpty()
  public outwardName: string;
}
