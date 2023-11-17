import { NextFunction, Request, Response } from 'express';
import {catchAsync, getImageUrl} from '@core/utils'
import {HttpException} from '@core/exceptions'

import RegisterDto from './dtos/register.dto';
import UserService from './user.service';
import UpdateUserDto from './dtos/updateUser.dto'
import ChangePasswordDto from './dtos/changePasswordDto';

export default class UserController {
  private userService = new UserService()

  public registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model: RegisterDto = req.body
    const user = await this.userService.createUser(model, req)
    res.status(201).json({data: user, message: 'Register user successfully'})
  })

  public getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await this.userService.getAllUsers()
    res.status(200).json({data: users})
  })

  public getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await this.userService.getUserById(req.params.id)
    res.status(200).json({data: user})
  })

  public updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model: UpdateUserDto = req.body

    if (req.body.email) {
      throw new HttpException(400, 'You cannot change email')
    }

    if (req.body.password) {
      throw new HttpException(400, 'You cannot change password')
    }

    const user = await this.userService.updateUser(req.user.id, model)
    res.status(200).json({ data: user, message: 'Update user successfully' })
  })
  public deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await this.userService.deleteUser(req.user.id)
    res.status(204).json({message: 'Delete user successfully'})
  })
  public changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model: ChangePasswordDto = req.body
    await this.userService.changePassword(req.user.id, model, req, res)
  })
  public uploadAvatar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const imageUrl = await getImageUrl(req)
    const user = await this.userService.uploadAvatar(userId, imageUrl)
    res.status(200).json({data: user, message: 'Upload avatar successfully'})
  })
}
