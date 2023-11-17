import { NextFunction, Request, Response } from 'express';
import {catchAsync} from '@core/utils'

import OTPService from './otp.service'
import SendOtpDto from './dtos/sendOtp.dto'
import IOtp from './otp.interface'
import VerifyOtpDto from './dtos/verifyOtp.dto'

export default class OTPController {
  private otpService = new OTPService();

  public sendOTP = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model: SendOtpDto = req.body;
    await this.otpService.sendOTP(model);
    res.status(201).json({
      status: 'success',
      message: 'OTP is sent successfully',
    });
  });

  public verifyOTP = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model: VerifyOtpDto = req.body
    const isVerified: boolean = await this.otpService.verifyOTP(model)
    res.status(200).json({
      verify: isVerified
    })
  });

  public sendRegisterOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model = req.body
    await this.otpService.sendRegisterOtp(model)
    res.status(201).json({
      status: 'success',
      message: 'OTP is sent successfully',
    })
  });

  public verifyEmailOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model = req.body
    await this.otpService.verifyEmailOtp(model)
    res.status(200).json({
      status: 'success',
      message: 'OTP is verified successfully',
    })
  });
}
