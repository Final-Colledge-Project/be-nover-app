import { Router } from "express"
import TeamWorkspaceController from "./teamWorkspace.controller";
import { Route } from "@core/interfaces";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import CreateTeamWorkspaceDto from "./dtos/createTeamWorkspace.dto";
import JoinGroupDto from "./dtos/joinGroup.dto";
export default class TeamWorkspaceRoute implements Route {
  public path = '/api/v1/team-workspace'
  public router = Router()
  public teamWorkspaceController = new TeamWorkspaceController()
  constructor(){
    this.initializeRoute();
  }

  private initializeRoute(){
    this.router.post(
      this.path,
      validationMiddleware(CreateTeamWorkspaceDto, true), 
      authMiddleware,
      this.teamWorkspaceController.createTeamWorkspace
    )
    this.router.post(
      this.path + '/:id/assign-admin',
      validationMiddleware(JoinGroupDto, true),
      authMiddleware,
      this.teamWorkspaceController.assignMemberToAdmin
    )
    this.router.get(
      this.path + '/:id',
      authMiddleware,
      this.teamWorkspaceController.getTeamWorkspaceById
    )
    this.router.get(
      this.path + '/:id/members',
      authMiddleware,
      this.teamWorkspaceController.getMemberTeamWorkspace
    )
  }
  
}