class HttpException extends Error {
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.message = message
  }
  public status: number,
  public message: string
}

export default HttpException
