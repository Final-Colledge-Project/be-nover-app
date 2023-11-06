import  TeamWorkspaceSchema from "../teamWorkspace.model"
import { IMember, IWorkspaceAdmin } from "../teamWorkspace.interface";
export const isAdmin = async (teamWorkspaceId : string, adminId: string) => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(teamWorkspaceId).exec();

  const isAdmin = teamWorkspace?.workspaceAdmins.find((admin : IWorkspaceAdmin) =>{
    console.log("🚀 ~ file: checkPermission.ts:6 ~ isAdmin ~ admin", admin.user)
    console.log("🚀 ~ file: checkPermission.ts:6 ~ isAdmin ~ adminId", adminId)
    return admin.user.toString() === adminId}
  );

  if(isAdmin === undefined){
    return false;
  }

  return true;
}

export const isMember = async (teamWorkspaceId : string, memberId: string) => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(teamWorkspaceId).exec();
  const checkMember =  teamWorkspace?.workspaceMembers.find((member : IMember ) => {
    return member.user.toString() === memberId
  });    
  const checkAdmin = teamWorkspace?.workspaceAdmins.find((admin : IWorkspaceAdmin) => admin.user.toString() === memberId);
  
  if(!!checkMember === false && !!checkAdmin === false){
    return false;
  }

  return true;
}

export const isSuperAdmin = async (teamWorkspaceId : string, superAdminId: string) => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(teamWorkspaceId).exec();
  const isAdmin = teamWorkspace?.workspaceAdmins.find((admin) => admin.user.toString() === superAdminId); 
  if(isAdmin?.role === 'superAdmin'){
    return true;
  }
  return false;
}
