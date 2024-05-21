import { catchAsync } from "@core/utils";
import InvitationService from "./invitation.service";
import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { startSession } from "mongoose";
export default class InvitationController {
  private invitationService = new InvitationService();
  public sendInvitation = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const model = req.body;
      const workspaceId = req.params.wsId;
      const invitation = await this.invitationService.sendInvitation(
        model,
        userId,
        workspaceId
      );
      res
        .status(StatusCodes.CREATED)
        .json({ data: invitation, message: "Send invitation successfully" });
    }
  );
  public responseInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      const userId = req.user.id;
      const status = req.query.status as string;
      const workspaceId = req.params.wsId;
      session.startTransaction();
      await this.invitationService.responseInvitation(
        userId,
        workspaceId,
        status,
        session
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Response invitation successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  public getInvitationDetail = catchAsync(async (req: any, res: any) => {
    const invitationId = req.params.id;
    const invitation = await this.invitationService.getInvitationDetail(
      invitationId
    );
    res
      .status(StatusCodes.OK)
      .json({ data: invitation, message: "Get invitation successfully" });
  });
}
