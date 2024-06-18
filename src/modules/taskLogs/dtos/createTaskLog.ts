import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export default class CreateTaskLogDto {
  constructor(
    userId: string,
    target: string,
    msg: string,
    oldVal: string,
    newVal: string
  ) {
    this.userId = userId;
    this.target = target;
    this.msg = msg;
    this.oldVal = oldVal;
    this.newVal = newVal;
  }
  @IsString()
  @IsNotEmpty()
  public userId: string;
  @IsString()
  @IsNotEmpty()
  public target: string;
  @IsString()
  @IsNotEmpty()
  public msg: string;
  @IsString()
  @IsOptional()
  public oldVal: string;
  @IsString()
  @IsOptional()
  public newVal: string;
}
