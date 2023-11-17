import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export default class CreateColumnDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'Title must be at least 2 characters long'
  })
  @MaxLength(30, {
    message: 'Title must be at most 30 characters long'
  })
  public title: string
  @IsNotEmpty()
  @IsString()
  public boardId: string
  constructor(title: string, boardId: string) {
    ;(this.title = title), (this.boardId = boardId)

}
