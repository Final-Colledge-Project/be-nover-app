import { Route } from "@core/interfaces";
import { Router } from "express";
import OTPController from "./otp.controller";
import { validationMiddleware } from "@core/middleware";
import SendOtpDto from "./dtos/sendOtp.dto";
import VerifyOtpDto from "./dtos/verifyOtp.dto";

export default class OTPRoute implements Route{
  public path = '/api/v1/authentication'
  public router = Router()

  public otpController = new OTPController()
  
  constructor(){
    this.initializeRoute()
  }

  private initializeRoute(){
    this.router.post(this.path + '/otp', validationMiddleware(SendOtpDto, true), this.otpController.sendOTP)
    this.router.post(this.path + '/verify-otp', validationMiddleware(VerifyOtpDto, true), this.otpController.verifyOTP)
  }
}