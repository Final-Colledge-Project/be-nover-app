import { catchAsync } from "@core/utils";
import InvitationService from "./invitation.service";
import {StatusCodes} from "http-status-codes";
import { NextFunction } from "express";
export default class InvitationController {
  private invitationService = new InvitationService();
  public sendInvitation =  catchAsync(async (req: any, res: any) => {
    const userId = req.user.id;
    const model = req.body;
    const workspaceId = req.params.id;
    const invitation = await this.invitationService.sendInvitation(model, userId, workspaceId);
    res.status(StatusCodes.CREATED).json({ data: invitation, message: "Send invitation successfully" });
  })
  public responseInvitation = catchAsync(async (req: any, res: any) => {
    const userId = req.user.id;
    const status = req.query.status;
    const workspaceId = req.params.id;
    await this.invitationService.responseInvitation(userId, workspaceId, status);
    res.status(StatusCodes.OK).json({ message: "Response invitation successfully" });
  })
  public getInvitationDetail = catchAsync(async (req: any, res: any) => {
    const userId = req.user.id;
    const invitationId = req.params.id;
    const invitation = await this.invitationService.getInvitationDetail(userId, invitationId);
    res.status(StatusCodes.OK).json({ data: invitation, message: "Get invitation successfully" });
  })
}