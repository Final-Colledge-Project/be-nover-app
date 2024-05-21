import { Router } from "express";
import InvitationController from "./invitation.controller";
import {
  authMiddleware,
  authorizePermission,
  validationMiddleware,
} from "@core/middleware";
import JoinGroupDto from "./dtos/joinGroupDto";
import { PERM_TYPE } from "@core/utils";

export default class InvitationRoute {
  public path = "/api/v1/invitations";
  public router = Router();
  public invitationController = new InvitationController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/workspace/:wsId",
      validationMiddleware(JoinGroupDto, true),
      authMiddleware,
      authorizePermission("member:invite", PERM_TYPE.workspace),
      this.invitationController.sendInvitation
    );
    this.router.patch(
      this.path + "/workspace/:wsId",
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
