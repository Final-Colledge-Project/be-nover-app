import { StatusCodes } from "http-status-codes";
import CreateIssueLinkTypeDto from "./dtos/createIssueLinkTypeDto";
import IssueLinkTypeService from "./issueLinkType.service";
import { Request, Response, NextFunction } from "express";
import UpdateIssueLinkTypeDto from "./dtos/updateIssueLinkTypeDto";
import { MAX_RESULT } from "@core/utils";
export default class IssueLinkTypeController {
  private issueLinkTypeService = new IssueLinkTypeService();
  public createLinkIssueType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const model: CreateIssueLinkTypeDto = req.body;
      const boardId = req.params.boardId;
      const newIssueLinkType =
        await this.issueLinkTypeService.createLinkIssueType(model, boardId);
      res.status(StatusCodes.CREATED).json({
        data: newIssueLinkType,
        message: "Create issue link type successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public updateLinkIssueType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const model: UpdateIssueLinkTypeDto = req.body;
      const issueLinkTypeId = req.params.issueLinkTypeId;
      await this.issueLinkTypeService.updateLinkIssueType(
        model,
        issueLinkTypeId
      );
      res.status(StatusCodes.OK).json({
        message: "Update issue link type successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public deleteIssueLinkType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const issueLinkTypeId = req.params.issueLinkTypeId;
      await this.issueLinkTypeService.deleteIssueLinkType(issueLinkTypeId);
      res.status(StatusCodes.OK).json({
        message: "Delete issue link type successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  public getIssueLinkTypesByBoard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const boardId = req.params.boardId;
      const userId = req.user.id;
      const issueLinkTypes =
        await this.issueLinkTypeService.getIssueLinkTypeByBoardId(req, boardId, userId);
      res.status(StatusCodes.OK).json({
        data: issueLinkTypes,
        maxResults: MAX_RESULT,
        message: "Get issue link type successfully",
      });
    } catch (err) {
      next(err);
    }
  };
}
