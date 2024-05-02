import { Route } from "@core/interfaces";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import { Router } from "express";
import ScheduleController from "./schedule.controller";
import ScheduleService from "./schedule.service";
import AddScheduleDto from "./dtos/addScheduleDto";
import UpdateScheduleDto from "./dtos/updateScheduleDto";

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
      validationMiddleware(AddScheduleDto, true),
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
      validationMiddleware(UpdateScheduleDto, true),
      authMiddleware,
      this.scheduleController.updateSchedule
    );
  }
}
