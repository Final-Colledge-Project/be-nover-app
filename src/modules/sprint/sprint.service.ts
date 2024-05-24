import { BoardSchema } from "@modules/boards";
import CreateSprintDto from "./dtos/createSprintDto";
import dayjs from "dayjs";
import { BOARD_TEMPLATE, SPRINT_DURATION } from "@core/utils";
import SprintSchema from "./sprint.model";
import ISprint from "./sprint.interface";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
export default class SprintService {
  private boardSchema = BoardSchema;
  private sprintSchema = SprintSchema;
  private isValidDuration(start: Date, end: Date, duration: string) {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    let durationNumber = 0;
    switch (duration) {
      case SPRINT_DURATION.oneWeek:
        durationNumber = 1;
        break;
      case SPRINT_DURATION.twoWeeks:
        durationNumber = 2;
        break;
      case SPRINT_DURATION.threeWeeks:
        durationNumber = 3;
        break;
      case SPRINT_DURATION.fourWeeks:
        durationNumber = 4;
        break;
      case SPRINT_DURATION.custom:
        durationNumber = 0;
        break;
    }
    if (durationNumber === 0) {
      if (startDate.isAfter(endDate)) {
        return false;
      }
    } else {
      if (startDate.add(durationNumber, "week").isAfter(endDate)) {
        return false;
      }
    }
    return true;
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
    const data = {
      ...model,
      boardId,
      creatorId: userId,
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
}
