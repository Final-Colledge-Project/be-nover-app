import { NextFunction, Request, Response } from "express";
import RegisterDto from "./dtos/register.dto";
import UserService from "./user.service";
import { TokenData } from "@modules/auth";
import { catchAsync } from "@core/utils";

export default class UserController {
  private userService = new UserService()

  public registerUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const model : RegisterDto = req.body
    const tokenData : TokenData = await this.userService.createUser(model)
    res.status(201).json({data: tokenData, message: "User created"})
  })

  public getAllUsers = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const users = await this.userService.getAllUsers()
    res.status(200).json({users})
  })

  public getUserById = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const user = await this.userService.getUserById(req.params.id)
    res.status(200).json({user})
  })

  public updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const model : RegisterDto = req.body
      const user = await this.userService.updateUser(req.params.id, model)
      res.status(200).json({user, message: "Update user successfully"})
  })

  public deleteUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    await this.userService.deleteUser(req.user.id)
    res.status(204).json({message: "Delete user successfully"})
  })
}