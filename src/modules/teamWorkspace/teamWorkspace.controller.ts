import { NextFunction, Request, Response } from "express";
import { catchAsync } from "@core/utils";
import TeamWorkspaceService from "./teamWorkspace.service";
import CreateTeamWorkspaceDto from "./dtos/createTeamWorkspace.dto";


export default class TeamWorkspaceController {
  private teamWorkspaceService = new TeamWorkspaceService();

  public createTeamWorkspace = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let model: CreateTeamWorkspaceDto = {name: "", adminWorkspaceId: ""};
    model.name = req.body.name;
    model.adminWorkspaceId = req.user.id;
    
    const teamWorkspace = await this.teamWorkspaceService.createTeamWorkspace(model);
    res.status(201).json({ data: teamWorkspace, message: "Create team workspace successfully" });
  })
}