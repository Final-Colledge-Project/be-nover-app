import { Route } from "@core/interfaces";
import { Router } from "express";
import SubCardController from "./subCard.controller";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import AddSubTaskDto from "./dtos/addSubTaskDto";
import UpdateSubTaskDto from "./dtos/updateSubTaskDto";
export default class SubCardRoute implements Route {
  public path = "/api/v1/subcards";
  public router = Router();
  public subCardController = new SubCardController();
  constructor() {
    this.initializeRoute();
  }
  private initializeRoute() {
    this.router.post(
      this.path,
      validationMiddleware(AddSubTaskDto, true),
      authMiddleware,
      this.subCardController.createSubCard
    );
    this.router.patch(
      this.path + "/:id/assign-member/:assigneeId",
      authMiddleware,
      this.subCardController.assignMemberToSubCard
    );
    this.router.get(
      this.path + "/card/:id",
      authMiddleware,
      this.subCardController.getAllSubCardInCard
    );
    this.router.patch(
      this.path + "/:id",
      validationMiddleware(UpdateSubTaskDto, true),
      authMiddleware,
      this.subCardController.updateSubCard
    )
  }
}
