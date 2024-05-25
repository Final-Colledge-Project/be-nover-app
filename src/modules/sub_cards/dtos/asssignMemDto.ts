import { IsNotEmpty, IsString } from "class-validator";
export default class AssignMemDto {
  constructor(memId: string) {
    this.memId = memId;
  }
  @IsNotEmpty()
  @IsString()
  public memId: string;
}
