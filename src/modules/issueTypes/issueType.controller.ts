import { StatusCodes } from "http-status-codes";
import CreateIssueTypeDto from "./dtos/createIssueTypeDto";
import IssueTypeService from "./issueType.service";
import { Request, Response, NextFunction } from "express";
import UpdateIssueTypeDto from "./dtos/updateIssueTypeDto";
import { MAX_RESULT } from "@core/utils";
export default class IssueTypeController {
  private issueTypeService = new IssueTypeService();
  public createIssueType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const model: CreateIssueTypeDto = req.body;
      const boardId = req.params.boardId;
      const newIssueType = await this.issueTypeService.createIssueType(
        model,
        boardId
      );
      res.status(StatusCodes.CREATED).json({
        data: newIssueType,
        message: "Create issue type successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public updateIssueType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const model: UpdateIssueTypeDto = req.body;
      const issueTypeId = req.params.issueTypeId;
      await this.issueTypeService.updateIssueType(model, issueTypeId);
      res.status(StatusCodes.OK).json({
        message: "Update issue type successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public deleteIssueType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const issueTypeId = req.params.issueTypeId;
      await this.issueTypeService.deleteIssueType(issueTypeId);
      res.status(StatusCodes.OK).json({
        message: "Delete issue type successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public getIssueTypeByBoardId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const boardId = req.params.boardId;
      const userId = req.user.id;
      const issueTypes = await this.issueTypeService.getIssueTypeByBoardId(
        req,
        boardId,
        userId
      );
      res.status(StatusCodes.OK).json({
        data: issueTypes,
        maxResults: MAX_RESULT,
        message: "Get issue types successfully",
      });
    } catch (err) {
      next(err);
    }
  };
}
