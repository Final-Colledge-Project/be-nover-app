import { BoardSchema } from "@modules/boards";
import CreateSprintDto from "./dtos/createSprintDto";
import dayjs from "dayjs";
import {
  BOARD_TEMPLATE,
  OBJECT_ID,
  SPRINT_DURATION,
  SPRINT_STATUS,
  isBoardMember,
} from "@core/utils";
import SprintSchema from "./sprint.model";
import ISprint, { IBacklogDetail } from "./sprint.interface";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import UpdateSprintDto from "./dtos/updateSprintDto";
import { CardSchema } from "@modules/cards";
import { ColumnSchema } from "@modules/columns";
import { ClientSession } from "mongoose";
import { cloneDeep, uniq } from "lodash";
export default class SprintService {
  private boardSchema = BoardSchema;
  private sprintSchema = SprintSchema;
  private cardSchema = CardSchema;
  private columnSchema = ColumnSchema;
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
      if (workingDays.includes(testDate.day())) {
        endDate = testDate;
        remainDays--;
      }
      if (remainDays === 1 && !workingDays.includes(testDate.day())) {
        endDate = testDate;
        remainDays--;
      }
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
    session: ClientSession
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
    let extendUpdateData = {};
    if (model.status === SPRINT_STATUS.completed) {
      const backlog = await this.sprintSchema.findOne({
        boardId: sprint.boardId,
        status: SPRINT_STATUS.backlog,
      });
      if (!backlog) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "Backlog not found, cannot complete sprint"
        );
      }
      const tasksInSprint = await this.cardSchema
        .find({
          sprintId,
        })
        .exec();
      const cloneTasks = cloneDeep(tasksInSprint);
      const totalStoryPoint = cloneTasks.reduce((total, card) => {
        return total + card.storyPoint || 0;
      }, 0);
      const resovledColumns = await this.columnSchema
        .find({
          boardId: sprint.boardId,
          isResolved: true,
        })
        .exec();
      const resolvedColIds = resovledColumns.map((e) => e._id.toString());
      const notResolvedTask = tasksInSprint.filter(
        (task) => !resolvedColIds.includes(task.columnId.toString())
      );
      console.log("🚀 ~ SprintService ~ notResolvedTask:", notResolvedTask);
      const resolvedTask = tasksInSprint.filter((task) =>
        resolvedColIds.includes(task.columnId.toString())
      );
      extendUpdateData = {
        cardOrderIds: resolvedTask.map((e) => e._id),
        actualCompletedDate: new Date(),
        totalStoryPoint: totalStoryPoint,
      };
      backlog.cardOrderIds = uniq([
        ...backlog.cardOrderIds,
        ...notResolvedTask.map((e) => e._id),
      ]);
      const bulkOps = notResolvedTask.map((task) => ({
        updateOne: {
          filter: { _id: task._id.toString() },
          update: {
            $set: {
              sprintId: backlog._id,
            },
          },
        },
      }));
      await this.cardSchema.bulkWrite(bulkOps, { session });
      await backlog.save({ session });
    }

    if (model.status === SPRINT_STATUS.pending) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Cannot revert sprint");
    }

    const data = {
      ...model,
      creatorId: userId,
      ...extendUpdateData,
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
  public async getBacklogDetail(
    boardId: string,
    userId: string
  ): Promise<IBacklogDetail[]> {
    const isMember = isBoardMember(boardId, userId);
    if (!isMember) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not member of this board"
      );
    }
    const existBoard = await this.boardSchema.findById(boardId).exec();
    if (!existBoard) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Board not found");
    }
    const detailSprint = await this.sprintSchema.aggregate([
      {
        $match: {
          boardId: new OBJECT_ID(boardId),
        },
      },
      {
        $lookup: {
          from: "cards",
          localField: "cardOrderIds",
          foreignField: "_id",
          as: "cards",
          pipeline: [
            {
              $match: {
                boardId: new OBJECT_ID(boardId),
              },
            },
            {
              $lookup: {
                from: "columns",
                localField: "columnId",
                foreignField: "_id",
                as: "column",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      title: 1,
                      isResolved: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "issuetypes",
                localField: "issueTypeId",
                foreignField: "_id",
                as: "issueType",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "users",
                let: {
                  memberIds: "$memberIds",
                },
                localField: "memberIds",
                foreignField: "_id",
                as: "members",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ["$_id", "$$memberIds"],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      fullName: {
                        $concat: ["$firstName", " ", "$lastName"],
                      },
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                column: {
                  $arrayElemAt: ["$column", 0],
                },
                issueType: {
                  $arrayElemAt: ["$issueType", 0],
                },
                storyPoint: 1,
                assignee: {
                  $arrayElemAt: ["$members", 0],
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          boardId: 1,
          name: 1,
          duration: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          cards: 1,
        },
      },
    ]);
    return detailSprint;
  }
}
