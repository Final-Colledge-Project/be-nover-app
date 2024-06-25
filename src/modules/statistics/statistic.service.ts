import { HttpException } from "@core/exceptions";
import { isBoardMember } from "@core/utils";
import { calculateAverageAgeReport } from "@core/utils/statistic";
import { CardSchema } from "@modules/cards";
import { EpicSchema } from "@modules/epics";
import { LabelSchema } from "@modules/labels";
import { PrioritySchema } from "@modules/priorities";
import { ISprint, SprintSchema } from "@modules/sprints";
import { UserSchema } from "@modules/users";
import { StatusCodes } from "http-status-codes";
import { concat } from "lodash";

export default class StatisticService {
  private cardSchema = CardSchema;
  private epicSchema = EpicSchema;
  private labelSchema = LabelSchema;
  private prioritySchema = PrioritySchema;
  private sprintSchema = SprintSchema;
  private userSchema = UserSchema;
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
}
