import { BoardSchema } from "@modules/boards";
import CreateSprintDto from "./dtos/createSprintDto";
import dayjs from "dayjs";
import {
  BOARD_TEMPLATE,
  SPRINT_DURATION,
  SPRINT_STATUS,
  isBoardMember,
} from "@core/utils";
import SprintSchema from "./sprint.model";
import ISprint from "./sprint.interface";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import UpdateSprintDto from "./dtos/updateSprintDto";
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
  private calculateEndDate(
    startDay: Date,
    duration: number,
    workingDays: number[]
  ): Date {
    let endDate = dayjs(startDay);
    let remainDays = duration * workingDays.length;
    let testDate = endDate;
    while (remainDays > 0) {
      testDate = testDate.add(1, "day");
      console.log("🚀 ~ SprintService ~ testDate:", testDate.toDate());
      if (workingDays.includes(testDate.day())) {
        endDate = testDate;
        console.log("🚀 ~ SprintService ~ endDate:", endDate.toDate());
        remainDays--;
      }
      if (remainDays === 1 && !workingDays.includes(testDate.day())) {
        endDate = testDate;
        remainDays--;
      }
      console.log("🚀 ~ SprintService ~ remainDays:", remainDays);
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
    const workingDays = board.workingDays;
    if (!board) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    if (board.template === BOARD_TEMPLATE.kanban) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid board template"
      );
    }
    let extendProps = {};
    if (model.startDate) {
      if (model.endDate) {
        const validDuration = this.isValidDuration(
          model.startDate,
          model.endDate,
          model.duration
        );
        if (!validDuration) {
          throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid duration");
        }
      }

      let endDate = null;
      if (model.duration !== 0) {
        endDate = this.calculateEndDate(
          model.startDate,
          model.duration,
          workingDays
        );
      } else {
        endDate = model.endDate;
      }
      extendProps = {
        endDate,
      };
    }

    const data = {
      ...model,
      boardId,
      creatorId: userId,
      duration: this.formatDuration(model.duration),
      ...extendProps,
    };
    const sprint = await this.sprintSchema.create([data], { session });
    await session.commitTransaction();
    session.endSession();
    return sprint[0];
  }
  public async updateSprint(
    model: UpdateSprintDto,
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

    if (model.status === SPRINT_STATUS.backlog) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Cannot update with this status"
      );
    }

    if (model.status === SPRINT_STATUS.pending) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Cannot revert sprint");
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
      throw new HttpException(StatusCodes.BAD_REQUEST, "Update sprint failed");
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
  public async getSprintsByBoardId(
    boardId: string,
    userId: string
  ): Promise<ISprint[]> {
    const isMem = await isBoardMember(boardId, userId);
    if (!isMem) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    const sprints = await this.sprintSchema
      .find({ boardId })
      .sort({ startDate: "asc" });
    return sprints;
  }
}
