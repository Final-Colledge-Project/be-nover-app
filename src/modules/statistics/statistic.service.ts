import { HttpException } from "@core/exceptions";
import { isBoardMember, SPRINT_STATUS } from "@core/utils";
import { calculateAverageAgeReport } from "@core/utils/statistic";
import { CardSchema } from "@modules/cards";
import { ColumnSchema } from "@modules/columns";
import { EpicSchema } from "@modules/epics";
import { LabelSchema } from "@modules/labels";
import { PrioritySchema } from "@modules/priorities";
import { ISprint, SprintSchema } from "@modules/sprints";
import { UserSchema } from "@modules/users";
import { StatusCodes } from "http-status-codes";
import { concat } from "lodash";
import { IVelocityReport } from "./statistic.interface";

export default class StatisticService {
  private cardSchema = CardSchema;
  private epicSchema = EpicSchema;
  private labelSchema = LabelSchema;
  private prioritySchema = PrioritySchema;
  private sprintSchema = SprintSchema;
  private userSchema = UserSchema;
  private columnSchema = ColumnSchema;
  public async generateAverageAgeReport(
    boardId: string,
    period: string,
    previousDay: number
  ): Promise<object> {
    const cards = await this.cardSchema
      .find({
        boardId,
        isActive: { $ne: false },
      })
      .exec();
    return calculateAverageAgeReport(cards, period, previousDay);
  }
  public async generateBurnDownReport(
    sprintId: string,
    boardId: string,
    userId: string
  ): Promise<ISprint> {
    const isMem = await isBoardMember(boardId, userId);
    if (!isMem) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    const sprint = await this.sprintSchema.findById(sprintId).exec();
    if (!sprint) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Sprint not found");
    }
    const cardsInSprints = await this.cardSchema
      .find({
        boardId,
        sprintId,
        isActive: { $ne: false },
      })
      .exec();
    const totalStoryPoint = cardsInSprints.reduce((total, card) => {
      return total + card.storyPoint;
    }, 0);
    const res = {
      ...sprint.toObject(),
      totalStoryPoint,
    };
    return res;
  }
  public async generateVelocityReport(
    boardId: string
  ): Promise<IVelocityReport[]> {
    const resolvedColumn = await this.columnSchema.find({
      boardId,
      isResolved: true,
    });
    const sprints = await this.sprintSchema
      .find({
        boardId,
        isActive: true,
        status: SPRINT_STATUS.completed,
      })
      .sort({ startDate: "asc" })
      .exec();
    const totalStoryPointInSprint = sprints.map(async (sprint) => {
      const cardsInSprints = await this.cardSchema
        .find({
          boardId,
          sprintId: sprint._id,
          isActive: { $ne: false },
        })
        .exec();
      const completedCards = cardsInSprints.filter((card) => {
        return resolvedColumn.some((column) => {
          return column._id.toString() === card.columnId.toString();
        });
      });
      const totalStoryPoint = cardsInSprints.reduce((total, card) => {
        return total + card.storyPoint;
      }, 0);
      const completedStoryPoint = completedCards.reduce((total, card) => {
        return total + card.storyPoint;
      }, 0);
      return {
        _id: sprint._id,
        name: sprint.name,
        totalStoryPoint,
        completedStoryPoint,
      };
    });
    return await Promise.all(totalStoryPointInSprint);
  }
}
