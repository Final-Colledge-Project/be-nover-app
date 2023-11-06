import { NextFunction, Request, Response } from "express";
import { catchAsync } from "@core/utils";
import TeamWorkspaceService from "./teamWorkspace.service";
import CreateTeamWorkspaceDto from "./dtos/createTeamWorkspace.dto";
import JoinGroupDto from "./dtos/joinGroup.dto";


export default class TeamWorkspaceController {
  private teamWorkspaceService = new TeamWorkspaceService();

  public createTeamWorkspace = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let model: CreateTeamWorkspaceDto = {name: "", superAdminWorkspaceId: ""};
    model.name = req.body.name;
    model.superAdminWorkspaceId = req.user.id;
    
    const teamWorkspace = await this.teamWorkspaceService.createTeamWorkspace(model);
    res.status(201).json({ data: teamWorkspace, message: "Create team workspace successfully" });
  })
  public sendInvitationToTeamWorkspace = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user.id;
    const workspaceId = req.params.id;
    const model : JoinGroupDto = req.body;
    await this.teamWorkspaceService.sendInvitationToTeamWorkspace(model, adminId, workspaceId);
    res.status(200).json({message: "Send invitation successfully" });
  })
  public acceptInvitationToTeamWorkspace = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const workspaceId = req.params.id;
    await this.teamWorkspaceService.acceptInvitationToTeamWorkspace(userId, workspaceId);
    res.status(200).json({message: "Accept invitation successfully" });
  })
  public assignMemberToAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user.id;
    const workspaceId = req.params.id;
    const emailMember : JoinGroupDto = req.body;
    await this.teamWorkspaceService.assignMemberToAdmin(emailMember, workspaceId, adminId);
    res.status(200).json({message: "Assign member to admin successfully" });
  })
}