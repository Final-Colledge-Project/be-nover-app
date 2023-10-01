import { NextFunction, Request, Response } from "express";
import OTPService from "./otp.service";
import VerifyDto from "./dtos/verify.dto";
import IOtp from "./otp.interface";



export default class OTPController {
  private otpService = new OTPService()

  public sendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model : VerifyDto = req.body
      const otp : IOtp = await this.otpService.sendOTP(model)
      res.status(201).json({
        status: "success", 
        message: "OTP is sent successfully"})
    }
    catch (err){
      next(err)
    }
  }
}