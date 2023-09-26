import { Route } from "@core/interfaces";
import { Router } from "express";
import AuthController from "./auth.controller";



export default class AuthRoute implements Route{
  public path = '/api/v1/login'
  public router = Router()

  public authController = new AuthController()
  
  constructor(){
    this.initializeRoute()
  }

  private initializeRoute(){
    this.router.post(this.path, this.authController.registerUser)
  }
}