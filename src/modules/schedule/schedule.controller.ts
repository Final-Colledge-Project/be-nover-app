import { catchAsync } from "@core/utils";
import ScheduleService from "./schedule.service";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { google } from "googleapis";
export default class ScheduleController {
  private scheduleService = new ScheduleService();
}
