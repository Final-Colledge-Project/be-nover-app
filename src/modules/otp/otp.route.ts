import { Route } from "@core/interfaces";
import { Router } from "express";
import OTPController from "./otp.controller";

export default class OTPRoute implements Route{
  public path = '/api/v1/verification'
  public router = Router()

  public otpController = new OTPController()
  
  constructor(){
    this.initializeRoute()
  }

  private initializeRoute(){
    this.router.post(this.path + '/verify-email', this.otpController.sendOTP)
  }
}