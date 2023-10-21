import { NextFunction, Request, Response } from "express";

import { TokenData } from "@modules/auth";
import AuthDto from "./auth.dto";
import AuthService from "./auth.service";
import { catchAsync } from "@core/utils";

export default class AuthController {
  private authService = new AuthService()

  public loginUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
      const model : AuthDto = req.body
      const tokenData : TokenData = await this.authService.login(model)
      res.status(201).json({data: tokenData, message: "Login success"})
  })


  public getCurrentLoginUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
      const user = await this.authService.getCurrentLoginUser(req.user.id) 
      res.status(200).json(user)
  })
}