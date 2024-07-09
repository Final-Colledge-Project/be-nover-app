import { Route } from "@core/interfaces";
import { Router } from "express";
import IssueTypeController from "./issueType.controller";
import {
  authMiddleware,
  authorizePermission,
  validationMiddleware,
} from "@core/middleware";
import CreateIssueTypeDto from "./dtos/createIssueTypeDto";
import { PERM_TYPE } from "@core/utils";
import UpdateIssueTypeDto from "./dtos/updateIssueTypeDto";
export default class IssueTypeRoute implements Route {
  public path = "/api/v1/issue-types";
  public router = Router();
  public issueTypeController = new IssueTypeController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path + "/board/:boardId",
      validationMiddleware(CreateIssueTypeDto, true),
      authMiddleware,
      authorizePermission("issueType:create", PERM_TYPE.board),
      this.issueTypeController.createIssueType
    );
    this.router.put(
      this.path + "/:issueTypeId/board/:boardId",
      validationMiddleware(UpdateIssueTypeDto, true),
      authMiddleware,
      authorizePermission("issueType:update", PERM_TYPE.board),
      this.issueTypeController.updateIssueType
    );
    this.router.delete(
      this.path + "/:issueTypeId/board/:boardId",
      authMiddleware,
      authorizePermission("issueType:delete", PERM_TYPE.board),
      this.issueTypeController.deleteIssueType
    );
    this.router.get(
      this.path + "/board/:boardId",
      authMiddleware,
      this.issueTypeController.getIssueTypeByBoardId
    );
  }
}
