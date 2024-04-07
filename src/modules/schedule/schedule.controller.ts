import { catchAsync } from "@core/utils";
import ScheduleService from "./schedule.service";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { google } from "googleapis";
export default class ScheduleController {
  private scheduleService = new ScheduleService();
  public getGoogleCalendar = catchAsync(async (req: Request, res: Response) => {
    const tokenLogin = req.user.tokenLogin;
    console.log("~~~~~~~>req.user", req.user);
    console.log(
      "🚀 ~ ScheduleController ~ getGoogleCalendar=catchAsync ~ tokenLogin:",
      tokenLogin
    );
    const googleCalendar = await this.scheduleService.getGoogleCalendar(
      tokenLogin
    );
    res.status(StatusCodes.OK).json({
      data: googleCalendar,
      message: "Get google calendar successfully",
    });
  });
}
