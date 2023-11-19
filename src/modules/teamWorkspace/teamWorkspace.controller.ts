import { NextFunction, Request, Response } from "express";
import { catchAsync } from "@core/utils";
import TeamWorkspaceService from "./teamWorkspace.service";
import CreateTeamWorkspaceDto from "./dtos/createTeamWorkspace.dto";
import JoinGroupDto from "./dtos/joinGroup.dto";
import { StatusCodes } from "http-status-codes";


export default class TeamWorkspaceController {
  private teamWorkspaceService = new TeamWorkspaceService();

  public createTeamWorkspace = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let model: CreateTeamWorkspaceDto = {name: "", superAdminWorkspaceId: ""};
    model.name = req.body.name;
    model.superAdminWorkspaceId = req.user.id;
    
    const teamWorkspace = await this.teamWorkspaceService.createTeamWorkspace(model);
    res.status(StatusCodes.CREATED).json({ data: teamWorkspace, message: "Create team workspace successfully" });
  })
  public assignMemberToAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user.id;
    const workspaceId = req.params.id;
    const emailMember : JoinGroupDto = req.body;
    await this.teamWorkspaceService.assignMemberToAdmin(emailMember, workspaceId, adminId);
    res.status(StatusCodes.OK).json({message: "Assign member to admin successfully" });
  })
  public getTeamWorkspaceById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const workspaceId = req.params.id;
    const teamWorkspace = await this.teamWorkspaceService.getTeamWorkspaceById(userId, workspaceId);
    res.status(StatusCodes.OK).json({ data: teamWorkspace, message: "Get team workspace successfully" });
  })
  public getMemberTeamWorkspace = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const workspaceId = req.params.id;
    const teamWorkspace = await this.teamWorkspaceService.getMemberTeamWorkspace(userId, workspaceId);
    res.status(StatusCodes.OK).json({ data: teamWorkspace, message: "Get team workspace detail successfully" });
  })
}