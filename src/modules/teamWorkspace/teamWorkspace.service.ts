import { isEmptyObject } from "@core/utils";
import CreateTeamWorkspaceDto from "./dtos/createTeamWorkspace.dto";
import TeamWorkspaceSchema from "./teamWorkspace.model";
import { HttpException } from "@core/exceptions";
import { ObjectId } from "mongodb"
import mongoose from "mongoose";
class TeamWorkspaceService {
  public teamWorkspaceSchema = TeamWorkspaceSchema;
  public async createTeamWorkspace(model: CreateTeamWorkspaceDto): Promise<any> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    } 
    let adminId = new mongoose.Types.ObjectId(model.adminWorkspaceId.toString());
    const teamWorkspace = await this.teamWorkspaceSchema.findOne({name: model.name, workspaceAdmin: adminId}).exec();    
    if (teamWorkspace) {
      throw new HttpException(
        409,
        `Team workspace with name ${model.name} already exists`
      );
    }
    const createdTeamWorkspace = await this.teamWorkspaceSchema.create({
      name: model.name,
      workspaceAdmin : model.adminWorkspaceId,
    });

    if(!createdTeamWorkspace){
      throw new HttpException(409, 'You are not an user');
    }

    return {
      id: createdTeamWorkspace._id,
      name: createdTeamWorkspace.name, 
      workspaceAdmin: createdTeamWorkspace.workspaceAdmin, 
      createdAt: createdTeamWorkspace.createdAt
    };
  }
}

export default TeamWorkspaceService;