import { Route } from "@core/interfaces";
import { Router } from "express";
import OTPController from "./otp.controller";

export default class OTPRoute implements Route{
  public path = '/api/v1/authentication'
  public router = Router()

  public otpController = new OTPController()
  
  constructor(){
    this.initializeRoute()
  }

  private initializeRoute(){
    this.router.post(this.path + '/otp', this.otpController.sendOTP)
    this.router.post(this.path + '/verify-otp', this.otpController.verifyOTP)
  }
}