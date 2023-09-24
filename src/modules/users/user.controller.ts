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
}