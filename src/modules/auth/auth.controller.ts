import { NextFunction, Request, Response } from 'express';
import { TokenData } from '@modules/auth';
import {catchAsync} from '@core/utils'

import AuthDto from './auth.dto'
import AuthService from './auth.service'
import ForgotDto from './dtos/forgot.dto';
import ResetDto from './dtos/reset.dto';

export default class AuthController {
  private authService = new AuthService()

  public loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model: AuthDto = req.body
    await this.authService.handleLogin(model, req, res)
  })

  public getCurrentLoginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await this.authService.getCurrentLoginUser(req.user.id)
    res.status(200).json({ data: user, message: 'Get current user success' })
  })

  public forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model: ForgotDto = req.body
    await this.authService.forgotPassword(model.email)
    res.status(200).json({message: 'OTP sent to email'})
  })

  public resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const model: ResetDto = req.body
    await this.authService.resetPassword(model, req, res)
  })

  public logOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await this.authService.handleLogout(req, res);
  });

  public refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.status(401).json({message: 'Unauthorized'});
    }
    const refreshToken = cookies.jwt
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'none', secure: true})

    const tokeData: TokenData = await this.authService.handleRefreshToken(refreshToken)

    res.cookie('jwt', tokeData.refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    })
    res.status(200).json({data: tokeData.accessToken, message: 'Refresh token success'})
  })
}
