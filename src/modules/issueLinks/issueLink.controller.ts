import { startSession } from "mongoose";
import IssueLinkService from "./issueLink.service";
import { Request, Response, NextFunction } from "express";
import AddIssueLinkDto from "./dtos/addIssueLinkDto";
import { StatusCodes } from "http-status-codes";
export default class IssueLinkController {
  private issueLinkService = new IssueLinkService();
  public addIssueLink = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const model: AddIssueLinkDto = req.body;
      const boardId = req.params.boardId;
      const userId = req.user.id;
      session.startTransaction();
      const newIssueLink = await this.issueLinkService.addIssueLink(
        model,
        boardId,
        userId,
        session
      );
      res
        .status(StatusCodes.CREATED)
        .json({ data: newIssueLink, message: "Add issue link successfully" });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
  public deleteIssueLink = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const issueLinkId = req.params.issueLinkId;
      const userId = req.user.id;
      session.startTransaction();
      await this.issueLinkService.deleteIssueLink(issueLinkId, session, userId);
      res
        .status(StatusCodes.OK)
        .json({ message: "Delete issue link successfully" });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
  public getIssueLinksByIssue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const issues = await this.issueLinkService.getIssueLinksByIssue(req);
      res
        .status(StatusCodes.OK)
        .json({ data: issues, message: "Get issue link successfully" });
    } catch (err) {
      next(err);
    }
  };
}
