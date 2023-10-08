import { NextFunction, Request, Response } from "express";

import { TokenData } from "@modules/auth";
import AuthDto from "./auth.dto";
import AuthService from "./auth.service";

export default class AuthController {
  private authService = new AuthService()

  public registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model : AuthDto = req.body
      const tokenData : TokenData = await this.authService.login(model)
      res.status(201).json({data: tokenData, message: "Login success"})
    }
    catch (err){
      next(err)
    }
  }


  public getCurrentLoginUser = async (req: Request, res: Response, next: NextFunction) => {
    try{
      const user = await this.authService.getCurrentLoginUser(req.user.id) 
      res.status(200).json(user)
    }
    catch (err) {
      next(err)
    }
  }
}