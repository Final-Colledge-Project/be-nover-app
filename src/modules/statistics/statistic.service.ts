import { calculateAverageAgeReport } from "@core/utils/statistic";
import { CardSchema } from "@modules/cards";
import { EpicSchema } from "@modules/epics";
import { LabelSchema } from "@modules/labels";
import { PrioritySchema } from "@modules/priorities";
import { SprintSchema } from "@modules/sprints";
import { UserSchema } from "@modules/users";

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
}
