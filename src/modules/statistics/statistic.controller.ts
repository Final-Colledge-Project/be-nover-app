import { Request, Response, NextFunction } from "express";
import StatisticService from "./statistic.service";
import { StatusCodes } from "http-status-codes";
import { IVelocityReport } from "./statistic.interface";
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
  public generateBurnDownReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sprintId = req.query.sprint as string;
      const boardId = req.params.boardId;
      const userId = req.user.id;
      const report = await this.statisticService.generateBurnDownReport(
        sprintId,
        boardId,
        userId
      );
      res.status(StatusCodes.OK).json({
        data: report,
        message: "Generate burn down report successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public generateVelocityReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const boardId = req.params.boardId;
      const report: IVelocityReport[] =
        await this.statisticService.generateVelocityReport(boardId);
      res.status(StatusCodes.OK).json({
        data: report,
        message: "Generate velocity report successfully",
      });
    } catch (err) {
      next(err);
    }
  };
}
