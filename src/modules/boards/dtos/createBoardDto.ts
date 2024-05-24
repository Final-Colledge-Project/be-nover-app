import { MODE_ACCESS, BOARD_TEMPLATE } from "@core/utils";
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  isEnum,
} from "class-validator";

export default class CreateBoardDto {
  constructor(
    title: string,
    description: string,
    type: string,
    key: string,
    template: string
  ) {
    this.title = title;
    this.description = description;
    this.type = type;
    this.key = key;
    this.template = template;
  }
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: "Title must be at least 3 characters long",
  })
  @MaxLength(30, {
    message: "Title must be at most 30 characters long",
  })
  public title: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: "Title must be at least 2 characters long",
  })
  @MaxLength(100, {
    message: "Title must be at most 100 characters long",
  })
  public description: string;
  @IsEnum([MODE_ACCESS.public, MODE_ACCESS.private], {
    message: "Type must be public or private",
  })
  @IsString()
  public type: string;
  @IsNotEmpty()
  @IsString()
  public key: string;
  @IsNotEmpty()
  @IsString()
  @IsEnum([BOARD_TEMPLATE.kanban, BOARD_TEMPLATE.scrum], {
    message: "Template must be kanban or scrum",
  })
  public template: string;
}
