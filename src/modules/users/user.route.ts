import { Route } from "@core/interfaces";
import { Router } from "express";
import UserController from "./user.controller";
import { authMiddleware, permissionMiddleware, validationMiddleware } from "@core/middleware";
import RegisterDto from "./dtos/register.dto";


export default class UsersRoute implements Route{
  public path = '/api/v1/users'
  public router = Router()
  
  public userController = new UserController()
  
  constructor(){
    this.initializeRoute()
  }

  private initializeRoute(){

    this.router.post(this.path, 
      validationMiddleware(RegisterDto, true), 
      this.userController.registerUser)
    
    this.router.get(this.path, 
      authMiddleware, 
      permissionMiddleware(['admin']),
      this.userController.getAllUsers)

    this.router.put(this.path + '/:id', 
      authMiddleware,
      validationMiddleware(RegisterDto, true), 
      this.userController.updateUser)

    this.router.get(this.path + '/:id', 
      authMiddleware,
      this.userController.getUserById)
    
    this.router.delete(this.path, 
      authMiddleware,
      this.userController.deleteUser)
  }
}