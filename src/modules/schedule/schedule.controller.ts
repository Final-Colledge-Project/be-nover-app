import { catchAsync } from "@core/utils";
import ScheduleService from "./schedule.service";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
export default class ScheduleController {
  private scheduleService = new ScheduleService();
  public addSchedule = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const model = req.body;
    await this.scheduleService.addSchedule(userId, model);
    res
      .status(StatusCodes.CREATED)
      .json({ message: "Create schedule successfully" });
  });
  public getSchedulesByUserId = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const schedules = await this.scheduleService.getSchedulesByUserId(userId);
      res.status(StatusCodes.OK).json({ data: schedules });
    }
  );
  public updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const scheduleId = req.params.id;
    const model = req.body;
    await this.scheduleService.updateSchedule(userId, scheduleId, model);
    res
      .status(StatusCodes.OK)
      .json({ message: "Update schedule successfully" });
  });
}
