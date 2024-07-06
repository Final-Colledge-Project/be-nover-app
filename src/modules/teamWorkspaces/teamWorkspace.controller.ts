import { NextFunction, Request, Response } from "express";
import { catchAsync } from "@core/utils";
import TeamWorkspaceService from "./teamWorkspace.service";
import CreateTeamWorkspaceDto from "./dtos/createTeamWorkspace.dto";
import JoinGroupDto from "./dtos/joinGroup.dto";
import { StatusCodes } from "http-status-codes";
import { startSession } from "mongoose";

export default class TeamWorkspaceController {
  private teamWorkspaceService = new TeamWorkspaceService();
  public createTeamWorkspace = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const session = await startSession();
    try {
      let model: CreateTeamWorkspaceDto = {
        name: "",
        superAdminWorkspaceId: "",
      };
      model.name = req.body.name;
      model.superAdminWorkspaceId = req.user.id;
      session.startTransaction();
      const teamWorkspace = await this.teamWorkspaceService.createTeamWorkspace(
        model,
        session
      );
      res.status(StatusCodes.CREATED).json({
        data: teamWorkspace,
        message: "Create team workspace successfully",
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  };
  public assignMemberToAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const adminId = req.user.id;
      const workspaceId = req.params.id;
      const emailMember: JoinGroupDto = req.body;
      await this.teamWorkspaceService.assignMemberToAdmin(
        emailMember,
        workspaceId,
        adminId
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Assign member to admin successfully" });
    }
  );
  public getTeamWorkspaceById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const workspaceId = req.params.wsId;
      const teamWorkspace =
        await this.teamWorkspaceService.getTeamWorkspaceById(
          userId,
          workspaceId
        );
      res.status(StatusCodes.OK).json({
        data: teamWorkspace,
        message: "Get team workspace successfully",
      });
    }
  );
  public getMemberTeamWorkspace = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const workspaceId = req.params.wsId;
      const teamWorkspace =
        await this.teamWorkspaceService.getMemberTeamWorkspace(
          userId,
          workspaceId
        );
      res.status(StatusCodes.OK).json({
        data: teamWorkspace,
        message: "Get team workspace detail successfully",
      });
    }
  );
  public deleteTeamWorkspace = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const workspaceId = req.params.id;
      await this.teamWorkspaceService.deleteWorkspace(workspaceId, userId);
      res
        .status(StatusCodes.OK)
        .json({ message: "Delete team workspace successfully" });
    }
  );
  public getTeamWorkspaceByUserId = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const teamWorkspace =
        await this.teamWorkspaceService.getWorkspaceByUserId(userId, req);
      res.status(StatusCodes.OK).json({
        data: teamWorkspace,
        message: "Get team workspace by user id successfully",
      });
    }
  );
}
