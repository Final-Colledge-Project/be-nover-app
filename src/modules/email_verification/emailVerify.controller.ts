import { NextFunction, Request, Response } from "express";
import EmailVerificationService from "./emailVerify.service";
import SendEmailDto from "./dtos/sendEmailDto";
import { IOtp } from "@modules/otp";
import VerifyEmailDto from "./dtos/verifyEmailDto";


export default class EmailVerificationController {
  private emailVerificationService = new EmailVerificationService();

  public sendEmailOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: SendEmailDto = req.body;
      const data : IOtp =  await this.emailVerificationService.sendEmailOTP(model);
      res.status(201).json({
        status: "success",
        data
      });
    } catch (err) {
      next(err);
    }
  };

  public verifyEmailOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model : VerifyEmailDto = req.body;
      await this.emailVerificationService.verifyEmailOTP(model);
      res.status(200).json({
        status: "success",
        verify: true
      });
    }
    catch (err) {
      next(err)
    }
  }
}