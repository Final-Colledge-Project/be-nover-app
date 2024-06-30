import { Route } from "@core/interfaces";
import { Router } from "express";
import IssueLinkController from "./issueLink.controller";
import {
  authMiddleware,
  authorizePermission,
  validationMiddleware,
} from "@core/middleware";
import AddIssueLinkDto from "./dtos/addIssueLinkDto";
import { PERM_TYPE } from "@core/utils";

export default class IssueLinkRoute implements Route {
  public path = "/api/v1/issue-links";
  public router = Router();
  public issueLinkController = new IssueLinkController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/board/:boardId",
      validationMiddleware(AddIssueLinkDto, true),
      authMiddleware,
      authorizePermission(
        "card:create, card:update, card:delete",
        PERM_TYPE.board
      ),
      this.issueLinkController.addIssueLink
    );
    this.router.delete(
      this.path + "/:issueLinkId/board/:boardId/",
      authMiddleware,
      authorizePermission(
        "card:create, card:update, card:delete",
        PERM_TYPE.board
      ),
      this.issueLinkController.deleteIssueLink
    );
    this.router.get(
      this.path + "/issue/:issueId/board/:boardId/",
      authMiddleware,
      authorizePermission(
        "card:create, card:update, card:delete",
        PERM_TYPE.board
      ),
      this.issueLinkController.getIssueLinksByIssue
    );
  }
}
