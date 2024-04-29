import {
  IsEmail,
  IsNotEmpty,
  Length,
  MaxLength,
  MinLength,
} from "class-validator";

export default class UpdateTokenDto {
  constructor(providerToken: string, providerRefreshToken: string) {
    this.providerToken = providerToken;
    this.providerRefreshToken = providerRefreshToken;
  }

  @IsNotEmpty()
  public providerToken: string;
  public providerRefreshToken: string;
}
