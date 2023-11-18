import { Router } from "express";
import InvitationController from "./invitation.controller";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import JoinGroupDto from "./dtos/joinGroupDto";

export default class InvitationRoute {
  public path = "/api/v1/invitations";
  public router = Router();
  public invitationController = new InvitationController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/workspace/:id",
      validationMiddleware(JoinGroupDto, true),
      authMiddleware,
      this.invitationController.sendInvitation
    );
    this.router.patch(
      this.path + "/workspace/:id",
      authMiddleware,
      this.invitationController.responseInvitation
    ),
    this.router.get(
      this.path + "/:id",
      authMiddleware,
      this.invitationController.getInvitationDetail
    );
  }
}
