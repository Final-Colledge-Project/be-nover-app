import { Route } from "@core/interfaces";
import { Router } from "express";
import AuthController from "./auth.controller";
import { authMiddleware } from "@core/middleware";


export default class AuthRoute implements Route{
  public path = '/api/v1/auth'
  public router = Router()

  public authController = new AuthController()
  
  constructor(){
    this.initializeRoute()
  }

  private initializeRoute(){
    this.router.post(this.path, this.authController.loginUser)
    this.router.get(this.path, authMiddleware, this.authController.getCurrentLoginUser)
  }
}