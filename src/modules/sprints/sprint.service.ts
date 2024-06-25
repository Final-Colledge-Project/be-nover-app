import { BoardSchema } from "@modules/boards";
import CreateSprintDto from "./dtos/createSprintDto";
import dayjs from "dayjs";
import { BOARD_TEMPLATE, SPRINT_DURATION, isBoardMember } from "@core/utils";
import SprintSchema from "./sprint.model";
import ISprint from "./sprint.interface";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
export default class SprintService {
  private boardSchema = BoardSchema;
  private sprintSchema = SprintSchema;
  private isValidDuration(start: Date, end: Date, duration: number) {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    if (duration === 0) {
      if (startDate.isAfter(endDate)) {
        return false;
      }
    }
    return true;
  }
  private formatDuration(duration: number): string {
    let formatDuration = SPRINT_DURATION.custom;
    switch (duration) {
      case 0:
        formatDuration = SPRINT_DURATION.custom;
        break;
      case 1:
        formatDuration = SPRINT_DURATION.oneWeek;
        break;
      case 2:
        formatDuration = SPRINT_DURATION.twoWeeks;
        break;
      case 3:
        formatDuration = SPRINT_DURATION.threeWeeks;
        break;
      case 4:
        formatDuration = SPRINT_DURATION.fourWeeks;
        break;
      default:
        formatDuration = SPRINT_DURATION.custom;
        break;
    }
    return formatDuration;
  }
  private calculateEndDate(startDay: Date, duration: number) {
    let startDate = dayjs(startDay);
    let endDate = startDate.add(duration * 7, "day");
    //Skip weekend
    while (endDate.day() === 0 || endDate.day() === 6) {
      //0: Sunday, 6: Saturday
      endDate = endDate.add(1, "day");
    }
    return endDate.toDate();
  }
  public async createSprint(
    model: CreateSprintDto,
    boardId: string,
    userId: string,
    session: any
  ): Promise<ISprint> {
    const board = await this.boardSchema.findById(boardId);
    if (!board) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    if (board.template === BOARD_TEMPLATE.kanban) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid board template"
      );
    }

    const validDuration = this.isValidDuration(
      model.startDate,
      model.endDate,
      model.duration
    );
    if (!validDuration) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid duration");
    }
    let endDate: Date;
    if (model.duration !== 0) {
      endDate = dayjs(model.startDate).add(model.duration, "day").toDate();
    } else {
      endDate = dayjs(model.startDate).add(model.duration, "week").toDate();
    }

    const data = {
      ...model,
      boardId,
      creatorId: userId,
      duration: this.formatDuration(model.duration),
      endDate:
        model.duration === 0
          ? endDate
          : this.calculateEndDate(model.startDate, model.duration),
    };
    const sprint = await this.sprintSchema.create([data], { session });
    await session.commitTransaction();
    session.endSession();
    return sprint[0];
  }
  public async updateSprint(
    model: CreateSprintDto,
    sprintId: string,
    userId: string,
    session: any
  ): Promise<ISprint> {
    const sprint = await this.sprintSchema.findById(sprintId);
    if (!sprint) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Sprint not found");
    }
    const validDuration = this.isValidDuration(
      model.startDate,
      model.endDate,
      model.duration
    );
    if (!validDuration) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid duration");
    }
    const data = {
      ...model,
      creatorId: userId,
    };
    const updateSprint = await this.sprintSchema.findByIdAndUpdate(
      sprintId,
      data,
      { session, new: true }
    );
    if (!updateSprint) {
      throw new Error("Update sprint failed");
    }
    await session.commitTransaction();
    session.endSession();
    return updateSprint;
  }
  public async getSprintById(
    sprintId: string,
    boardId: string,
    userId: string
  ): Promise<ISprint> {
    const isMem = await isBoardMember(boardId, userId);
    if (!isMem) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    const sprint = await this.sprintSchema.findById(sprintId);
    if (!sprint) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Sprint not found");
    }
    
    return sprint;
  }
}
