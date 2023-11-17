import { NextFunction, Request, Response } from "express";
import EmailVerificationService from "./emailVerify.service";
import SendEmailDto from "./dtos/sendEmailDto";
import { IOtp } from "@modules/otp";
import VerifyEmailDto from "./dtos/verifyEmailDto";
import { catchAsync } from "@core/utils";


export default class EmailVerificationController {
  private emailVerificationService = new EmailVerificationService();

  public sendEmailOTP = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const model: SendEmailDto = req.body;
    const data : IOtp =  await this.emailVerificationService.sendEmailOTP(model);
    res.status(201).json({
      status: "success",
      data
    });
  });

  public verifyEmailOTP = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const model : VerifyEmailDto = req.body;
    await this.emailVerificationService.verifyEmailOTP(model);
    res.status(200).json({
      status: "success",
      verify: true
    });
  })
}