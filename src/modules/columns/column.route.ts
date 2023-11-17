import { Route } from '@core/interfaces';
import { Router } from 'express';
import {authMiddleware, validationMiddleware} from '@core/middleware'

import ColumnController from './column.controller'
import CreateColumnDto from './dtos/createColumnDto';

export default class ColumnRoute implements Route {
  public path = '/api/v1/columns';
  public router = Router();
  public columnController = new ColumnController()
  constructor() {
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.post(
      this.path,
      validationMiddleware(CreateColumnDto, true),
      authMiddleware,
      this.columnController.createColumn
    );
  }
}
