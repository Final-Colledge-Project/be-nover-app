import { Route } from "@core/interfaces";
import { Router } from "express";
import UserController from "./user.controller";


export default class UsersRoute implements Route{
  public path = '/api/v1/users'
  public router = Router()

  public userController = new UserController()
  
  constructor(){
    this.initializeRoute()
  }

  private initializeRoute(){
    this.router.post(this.path, this.userController.registerUser)
  }


}