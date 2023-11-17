import { Route } from '@core/interfaces';
import { Router } from 'express';
import {authMiddleware, validationMiddleware} from '@core/middleware'

import LabelController from './label.controller'
import CreateLabelDto from './dtos/createLabelDto';

export default class LabelRoute implements Route {
  public path = '/api/v1/labels';
  public router = Router();
  public labelController = new LabelController();
  constructor() {
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.post(
      this.path,
      validationMiddleware(CreateLabelDto, true),
      authMiddleware,
      this.labelController.createLabel
    ),
      this.router.get(`${this.path}/board/:id`, authMiddleware, this.labelController.getLabelsByBoardId),
      this.router.get(`${this.path}/:id`, authMiddleware, this.labelController.getLabelById);
    this.router.patch(`${this.path}/:id`, authMiddleware, this.labelController.updateLabel),
      this.router.delete(`${this.path}/:id`, authMiddleware, this.labelController.deleteLabel)
  }
}
