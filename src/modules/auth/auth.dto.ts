export default class AuthDto {
  public email: string;
  public password: string;

  constructor(model: AuthDto){
    this.email = model.email
    this.password = model.password
  }
  
}