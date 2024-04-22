import { catchAsync } from "@core/utils";
import ScheduleService from "./schedule.service";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { google } from "googleapis";
export default class ScheduleController {
  private scheduleService = new ScheduleService();
  public getGoogleCalendar = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    console.log(
      "🚀 ~ ScheduleController ~ getGoogleCalendar=catchAsync ~ userId:",
      userId
    );
    const googleCalendar = await this.scheduleService.getGoogleCalendar(userId);
    res.status(StatusCodes.OK).json({
      data: googleCalendar,
      message: "Get google calendar successfully",
    });
  });
  public verifyGoogleToken = catchAsync(async (req: Request, res: Response) => {
    const currentUserId = req.user.id;
    const isValid = await this.scheduleService.verifyGoogleToken(currentUserId);
    res.status(StatusCodes.OK).json(isValid);
  });
}
