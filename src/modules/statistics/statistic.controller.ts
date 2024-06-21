import { Request, Response, NextFunction } from "express";
import StatisticService from "./statistic.service";
import { StatusCodes } from "http-status-codes";
export default class StatisticController {
  private statisticService = new StatisticService();
  public generateAverageAgeReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const boardId = req.params.boardId;
      const period = req.query.period as string;
      const previousDay = parseInt(req.query.previousDay as string);
      const report = await this.statisticService.generateAverageAgeReport(
        boardId,
        period,
        previousDay
      );
      res.status(StatusCodes.OK).json({
        data: report,
        message: "Generate average age report successfully",
      });
    } catch (err) {
      next(err);
    }
  };
}
