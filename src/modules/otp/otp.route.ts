import { Route } from '@core/interfaces';
import { Router } from 'express';
import {validationMiddleware} from '@core/middleware'
import SendEmailDto from '@modules/email_verification/dtos/sendEmailDto'

import OTPController from './otp.controller';
import SendOtpDto from './dtos/sendOtp.dto'
import VerifyOtpDto from './dtos/verifyOtp.dto'

export default class OTPRoute implements Route {
  public path = '/api/v1/authentication'
  public router = Router()

  public otpController = new OTPController()

  constructor() {
    this.initializeRoute()
  }

  private initializeRoute() {
    this.router.post(`${this.path}/otp`, validationMiddleware(SendOtpDto, true), this.otpController.sendOTP)
    this.router.post(
      `${this.path}/verify-otp`,
      validationMiddleware(VerifyOtpDto, true),
      this.otpController.verifyEmailOtp
    )
    this.router.post(
      `${this.path}/otp-registration`,
      validationMiddleware(SendOtpDto, true),
      this.otpController.sendRegisterOtp
    )
  }
}
