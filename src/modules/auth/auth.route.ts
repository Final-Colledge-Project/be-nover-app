import { Route } from "@core/interfaces";
import { Router } from "express";
import AuthController from "./auth.controller";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import ForgotDto from "./dtos/forgot.dto";
import AuthDto from "./auth.dto";
import ResetDto from "./dtos/reset.dto";


export default class AuthRoute implements Route{
  public path = '/api/v1/auth'
  public router = Router()

  public authController = new AuthController()
  
  constructor(){
    this.initializeRoute()
  }

  private initializeRoute(){
    this.router.post(this.path,
      validationMiddleware(AuthDto, true), 
      this.authController.loginUser);

    this.router.get(this.path,
      authMiddleware,
      this.authController.getCurrentLoginUser);
    
    this.router.post(this.path + '/forgot-password', 
      validationMiddleware(ForgotDto, true), 
      this.authController.forgotPassword);
    
    this.router.patch(this.path + '/reset-password', 
      validationMiddleware(ResetDto, true), 
      this.authController.resetPassword);

    this.router.get(this.path + '/refresh-token', this.authController.refreshToken);

    this.router.get(this.path + '/logout', this.authController.logOut);

  }
}