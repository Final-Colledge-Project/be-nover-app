import { Route } from "@core/interfaces";
import { Router } from "express";
import StatisticController from "./statistic.controller";
import { authMiddleware, authorizePermission } from "@core/middleware";
import { PERM_TYPE } from "@core/utils";
export default class StatisticRoute implements Route {
  public path = "/api/v1/statistics";
  public router = Router();
  public statisticController = new StatisticController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.get(
      this.path + "/average-age/board/:boardId",
      authMiddleware,
      authorizePermission("report:create", PERM_TYPE.board),
      this.statisticController.generateAverageAgeReport
    );
    this.router.get(
      this.path + "/burn-down/board/:boardId",
      authMiddleware,
      authorizePermission("report:create", PERM_TYPE.board),
      this.statisticController.generateBurnDownReport
    );
  }
}
