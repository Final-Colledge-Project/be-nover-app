import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import { isEmptyObject, isJsonString } from "@core/utils";
import ScheduleSchema from "./schedule.model";
import AddScheduleDto from "./dtos/addScheduleDto";
import ISchedule from "./schedule.interface";
import UpdateScheduleDto from "./dtos/updateScheduleDto";
export default class ScheduleService {
  private scheduleSchema = ScheduleSchema;
  public async addSchedule(
    userId: string,
    model: AddScheduleDto
  ): Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    await this.scheduleSchema.create({
      ...model,
      userId,
    });
  }
  public async getSchedulesByUserId(userId: string): Promise<ISchedule[]> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    const schedules = await this.scheduleSchema.find({ userId }).exec();
    return schedules;
  }
  public async updateSchedule(
    userId: string,
    scheduleId: string,
    model: UpdateScheduleDto
  ): Promise<void> {
    if (!userId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "UserId is required");
    }
    if (!scheduleId) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "ScheduleId is required"
      );
    }
    await this.scheduleSchema
      .findOneAndUpdate({ userId, _id: scheduleId }, model)
      .exec();
  }
}
