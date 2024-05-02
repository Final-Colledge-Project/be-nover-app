import { Route } from "@core/interfaces";
import { authMiddleware } from "@core/middleware";
import { Router } from "express";
import ScheduleController from "./schedule.controller";
import ScheduleService from "./schedule.service";

export default class ScheduleRoute implements Route {
  public path = "/api/v1/schedules";
  public router = Router();
  public scheduleController = new ScheduleController();
  public scheduleService = new ScheduleService();
  constructor() {
    this.initializeRoute();
  }
  public initializeRoute() {
    this.router.post(
      this.path,
      authMiddleware,
      this.scheduleController.addSchedule
    );
    this.router.get(
      this.path,
      authMiddleware,
      this.scheduleController.getSchedulesByUserId
    );
    this.router.put(
      this.path + "/:id",
      authMiddleware,
      this.scheduleController.updateSchedule
    );
  }
}
