import { Route } from "@core/interfaces";
import { authMiddleware } from "@core/middleware";
import { Router } from "express";
import ScheduleController from "./schedule.controller";
import { google } from "googleapis";
import axios from "axios";
import ScheduleService from "./schedule.service";
import { UserSchema } from "@modules/users";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";

export default class ScheduleRoute implements Route {
  public path = "/api/v1/schedule";
  public router = Router();
  public scheduleController = new ScheduleController();
  public scheduleService = new ScheduleService();

  private scope = ["https://www.googleapis.com/auth/calendar"];
  constructor() {}
}
