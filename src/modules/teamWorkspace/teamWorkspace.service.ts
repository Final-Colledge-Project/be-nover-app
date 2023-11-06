import { Email, isEmptyObject } from "@core/utils";
import CreateTeamWorkspaceDto from "./dtos/createTeamWorkspace.dto";
import TeamWorkspaceSchema from "./teamWorkspace.model";
import { HttpException } from "@core/exceptions";
import { ObjectId } from "mongodb"
import mongoose, { Model } from "mongoose";
import JoinGroupDto from "./dtos/joinGroup.dto";
import { isAdmin, isMember } from "./utils/checkPermission";
import { UserSchema } from "@modules/users";
import ITeamWorkspace, { IInvitedMember, IMember } from "./teamWorkspace.interface";

class TeamWorkspaceService {
  public teamWorkspaceSchema = TeamWorkspaceSchema;
  public async createTeamWorkspace(model: CreateTeamWorkspaceDto): Promise<Object> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    } 
    const superAdminId = model.superAdminWorkspaceId;
    const teamWorkspace = await this.teamWorkspaceSchema.findOne({name: model.name}).exec();    
    if (teamWorkspace && teamWorkspace.workspaceAdmins.find((admin) => admin.user.toString() === superAdminId)) {
      throw new HttpException(
        409,
        `Team workspace with name ${model.name} already exists`
      );
    }
    const newWorskspace = await this.teamWorkspaceSchema.create({
      name: model.name,
      workspaceAdmins : [{user: superAdminId, role: 'superAdmin'}],
    });
    if(!newWorskspace){
      throw new HttpException(409, 'Create team workspace failed');
    }
    return {
      id: newWorskspace.id,
      name: newWorskspace.name,
      workspaceSuperAdmins: superAdminId
    }
  }
  public async sendInvitationToTeamWorkspace(model: JoinGroupDto, adminId: string, workspaceId: string): Promise<any> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    } 

    const adminUser = await UserSchema.findById(adminId).exec();
    const invitedUser = await UserSchema.findOne({email: model.emailUser}).exec();
    if(!adminUser){
      throw new HttpException(409, 'You are not an user');
    }
    if(!invitedUser){
      throw new HttpException(409, 'User not found');
    }
    const teamWorkspace= await this.teamWorkspaceSchema.findById(workspaceId).exec();

    if(!teamWorkspace){
      throw new HttpException(409, 'Workspace not found');
    }

    const checkMember = await isMember(workspaceId, invitedUser.id)
    console.log('=================> member ID', invitedUser.id)
    console.log("🚀 ~ file: teamWorkspace.service.ts:50 ~ TeamWorkspaceService ~ sendInvitationToTeamWorkspace ~ checkMember:", checkMember)
    if(await isAdmin(workspaceId, adminId) === false){
      throw new HttpException(409, 'You are not the admin');
    } 
    
    if( checkMember === true){
      throw new HttpException(409, 'User is already a member');
    }

    

    const url = ''
    await new Email(invitedUser, url, adminUser).sendInvitationMember();

    const existInvitedMember = await teamWorkspace.invitedMembers.find((member) => member.user.toString() === invitedUser.id);
    
    if(!existInvitedMember){
      teamWorkspace.invitedMembers.unshift({
        user: invitedUser.id, 
        requestDate: new Date(Date.now()),
        status: 'pending'
      } as IInvitedMember);
    }

    await teamWorkspace.save();
  }
  public async acceptInvitationToTeamWorkspace(userId: string, workspaceId: string): Promise<void> {
    const teamWorkspace = await this.teamWorkspaceSchema.findById(workspaceId).exec();
    if(!teamWorkspace){
      throw new HttpException(409, 'Workspace not found');
    }
    const existInvitedMember = await teamWorkspace.invitedMembers.find((member) => member.user.toString() === userId);

    if(!existInvitedMember){
      throw new HttpException(409, 'You are not invited');
    }
    
    if(existInvitedMember.status === 'accepted'){
      throw new HttpException(409, 'You are already accepted');
    }

    existInvitedMember.status = 'accepted';
    teamWorkspace.workspaceMembers.unshift({
      user: userId, 
      joinDate: new Date(Date.now()),
    } as IMember)
    await teamWorkspace.save();
  }


}

export default TeamWorkspaceService;