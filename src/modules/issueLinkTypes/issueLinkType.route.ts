import { Route } from "@core/interfaces";
import { Router } from "express";
import IssueLinkTypeController from "./issueLinkType.controller";
import {
  authMiddleware,
  authorizePermission,
  validationMiddleware,
} from "@core/middleware";
import CreateIssueLinkTypeDto from "./dtos/createIssueLinkTypeDto";
import { PERM_TYPE } from "@core/utils";
import UpdateIssueLinkTypeDto from "./dtos/updateIssueLinkTypeDto";

export default class IssueLinkTypeRoute implements Route {
  public path = "/api/v1/link-types";
  public router = Router();
  public issueLinkTypeController = new IssueLinkTypeController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/board/:boardId",
      validationMiddleware(CreateIssueLinkTypeDto, true),
      authMiddleware,
      authorizePermission("issueLinkType:create", PERM_TYPE.board),
      this.issueLinkTypeController.createLinkIssueType
    );
    this.router.put(
      this.path + "/:issueLinkTypeId/board/:boardId",
      validationMiddleware(UpdateIssueLinkTypeDto, true),
      authMiddleware,
      authorizePermission("issueLinkType:update", PERM_TYPE.board),
      this.issueLinkTypeController.updateLinkIssueType
    );
    this.router.delete(
      this.path + "/:issueLinkTypeId/board/:boardId",
      authMiddleware,
      authorizePermission("issueLinkType:delete", PERM_TYPE.board),
      this.issueLinkTypeController.deleteIssueLinkType
    );
    this.router.get(
      this.path + "/board/:boardId",
      authMiddleware,
      this.issueLinkTypeController.getIssueLinkTypesByBoard
    );
  }
}
