import { NextFunction, Request, Response } from "express";
import OTPService from "./otp.service";
import SendOtpDto from "./dtos/sendOtp.dto";
import IOtp from "./otp.interface";
import VerifyOtpDto from "./dtos/verifyOtp.dto";

export default class OTPController {
  private otpService = new OTPService();

  public sendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: SendOtpDto = req.body;
      const otp: IOtp = await this.otpService.sendOTP(model);
      res.status(201).json({
        status: "success",
        message: "OTP is sent successfully",
      });
    } catch (err) {
      next(err);
    }
  };

  public verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model : VerifyOtpDto = req.body
      const isVerified : boolean = await this.otpService.verifyOTP(model)
      res.status(200).json({
        verify: isVerified
      })
    }
    catch(err){
      next(err)
    }
  }
}
