import { Route } from '@core/interfaces';
import { Router } from 'express';

import EmailVerificationController from './emailVerify.controller';

export default class EmailVerificationRoute implements Route {
  public path = '/api/v1/email-verification'
  public router = Router()

  public emailVerificationController = new EmailVerificationController()

  constructor() {
    this.initializeRoute()
  }

  private initializeRoute() {
    this.router.post(this.path, this.emailVerificationController.sendEmailOTP)
    this.router.post(`${this.path}/verify`, this.emailVerificationController.verifyEmailOTP)
  }
}
