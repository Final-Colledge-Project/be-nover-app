export default class SendEmailDto {
  public email: string;

  constructor(model: SendEmailDto) {
    this.email = model.email;
  }
}
