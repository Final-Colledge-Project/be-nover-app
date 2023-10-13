import { NextFunction, Request, Response } from "express";
import RegisterDto from "./dtos/register.dto";
import UserService from "./user.service";
import { TokenData } from "@modules/auth";

export default class UserController {
  private userService = new UserService()

  public registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model : RegisterDto = req.body
      const tokenData : TokenData = await this.userService.createUser(model)
      res.status(201).json({data: tokenData, message: "User created"})
    }
    catch (err){
      next(err)
    }
  }

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(req.params.id)
      res.status(200).json(user)
    }
    catch (err){
      next(err)
    }
  }

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model : RegisterDto = req.body
      const user = await this.userService.updateUser(req.params.id, model)
      res.status(200).json({user, message: "Update user successfully"})
    }
    catch (err){
      next(err)
    }
  }  
}