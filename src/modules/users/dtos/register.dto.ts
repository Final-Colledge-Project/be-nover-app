export default class RegisterDto {
  public firstName: string;
  public lastName: string;
  public email: string;
  public password: string;
  public phone: number;
  public birthDate: Date;
  public address: string;

  constructor(model: RegisterDto){
    this.firstName = model.firstName
    this.lastName = model.lastName
    this.email = model.email
    this.password = model.password
    this.phone = model.phone
    this.birthDate = model.birthDate
    this.address = model.address
  }
  
}