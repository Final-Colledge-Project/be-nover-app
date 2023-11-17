import { Route } from '@core/interfaces';
import { Router } from 'express';
import {authMiddleware, permissionMiddleware, validationMiddleware} from '@core/middleware'
import {uploadSingleImage} from '@core/middleware/uploadImage.middleware'

import UserController from './user.controller';
import RegisterDto from './dtos/register.dto'
import UpdateUserDto from './dtos/updateUser.dto'
import ChangePasswordDto from './dtos/changePasswordDto'

export default class UsersRoute implements Route {
  public path = '/api/v1/users'
  public router = Router()

  public userController = new UserController()

  constructor() {
    this.initializeRoute()
  }

  private initializeRoute() {
    this.router.post(this.path, validationMiddleware(RegisterDto, true), this.userController.registerUser)

    this.router.get(this.path, authMiddleware, permissionMiddleware(['admin']), this.userController.getAllUsers)

    this.router.patch(
      this.path,
      validationMiddleware(UpdateUserDto, true),
      authMiddleware,
      this.userController.updateUser,
    );

    this.router.patch(
      `${this.path}/change-password`,
      validationMiddleware(ChangePasswordDto, true),
      authMiddleware,
      this.userController.changePassword,
    )

    this.router.get(`${this.path}/:id`, authMiddleware, this.userController.getUserById)

    this.router.delete(this.path, authMiddleware, this.userController.deleteUser)
    this.router.patch(
      `${this.path}/upload-avatar`,
      authMiddleware,
      uploadSingleImage('avatar'),
      this.userController.uploadAvatar,
    );
  }
}
