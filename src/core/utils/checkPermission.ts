import { BoardSchema } from '@modules/boards';
import { TeamWorkspaceSchema } from '@modules/teamWorkspace';
import { IMember, IWorkspaceAdmin } from '@modules/teamWorkspace/teamWorkspace.interface';

export const isWorkspaceAdmin = async (teamWorkspaceId: string, adminId: string) => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(teamWorkspaceId).exec();

  const isAdmin = teamWorkspace?.workspaceAdmins.find((admin: IWorkspaceAdmin) => {
    return admin.user.toString() === adminId;
  })

  if (isAdmin === undefined) {
    return false;
  }

  return true;
}

export const isWorkspaceMember = async (teamWorkspaceId: string, memberId: string) => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(teamWorkspaceId).exec();
  const checkMember = teamWorkspace?.workspaceMembers.find((member: IMember) => {
    return member.user.toString() === memberId
  });
  const checkAdmin = teamWorkspace?.workspaceAdmins.find((admin: IWorkspaceAdmin) => admin.user.toString() === memberId);

  if (Boolean(checkMember) === false && Boolean(checkAdmin) === false) {
    return false;
  }

  return true;
}

export const isSuperAdmin = async (teamWorkspaceId: string, superAdminId: string) => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(teamWorkspaceId).exec();
  const isAdmin = teamWorkspace?.workspaceAdmins.find((admin) => admin.user.toString() === superAdminId);
  if (isAdmin?.role === 'superAdmin') {
    return true;
  }
  return false;
}

export const isBoardAdmin = async (boardId: string, adminId: string) => {
  const existBoard = await BoardSchema.findById(boardId).exec();
  const isAdmin = existBoard?.ownerIds.find((admin: string) => {
    return admin.toString() === adminId;
  })

  if (isAdmin === undefined) {
    return false;
  }

  return true;
}

export const isBoardMember = async (boardId: string, memberId: string) => {
  const teamWorkspace = await BoardSchema.findById(boardId).exec();
  const checkMember = teamWorkspace?.memberIds.find((member: string) => {
    return member.toString() === memberId
  });
  const checkAdmin = teamWorkspace?.ownerIds.find((admin: string) => admin.toString() === memberId);

  if (Boolean(checkMember) === false && Boolean(checkAdmin) === false) {
    return false;
  }

  return true;
}
