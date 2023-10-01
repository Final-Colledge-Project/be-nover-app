export default class VerifyDto {
  public email: string
  public subject: string
  public message: string
  public duration: number

  constructor(model: VerifyDto){
    this.email = model.email
    this.subject = model.subject
    this.message = model.message
    this.duration = model.duration
  }
  
}