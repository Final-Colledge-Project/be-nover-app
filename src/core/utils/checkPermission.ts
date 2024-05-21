import { BoardSchema } from "@modules/boards";
import { CardSchema } from "@modules/cards";
import { TeamWorkspaceSchema } from "@modules/teamWorkspace";
import {
  IMember,
  IWorkspaceAdmin,
} from "@modules/teamWorkspace/teamWorkspace.interface";
import { MODE_ACCESS, ROLE } from "./constant";

export const isWorkspaceAdmin = async (
  teamWorkspaceId: string,
  adminId: string
): Promise<Boolean> => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(
    teamWorkspaceId
  ).exec();

  const wsAdmin = teamWorkspace?.workspaceAdmins.find(
    (admin: IWorkspaceAdmin) => {
      return admin.user.toString() === adminId;
    }
  );

  if (!wsAdmin) {
    return false;
  }

  return wsAdmin?.role === ROLE.admin || wsAdmin?.role === ROLE.superAdmin;
};

export const isWorkspaceMember = async (
  teamWorkspaceId: string,
  memberId: string
): Promise<Boolean> => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(
    teamWorkspaceId
  ).exec();
  const checkMember = teamWorkspace?.workspaceMembers.find(
    (member: IMember) => {
      return member.user.toString() === memberId;
    }
  );
  return !!checkMember;
};

export const isSuperAdmin = async (
  teamWorkspaceId: string,
  superAdminId: string
): Promise<Boolean> => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(
    teamWorkspaceId
  ).exec();
  const isAdmin = teamWorkspace?.workspaceAdmins.find(
    (admin) => admin.user.toString() === superAdminId
  );
  return isAdmin?.role === ROLE.superAdmin;
};

export const isBoardAdmin = async (
  boardId: string,
  adminId: string
): Promise<Boolean> => {
  console.log("🚀 ~ boardId:", boardId);
  const existBoard = await BoardSchema.findById(boardId).exec();
  console.log("🚀 ~ existBoard:", existBoard);
  if (!existBoard) return false;
  console.log("~~~~~~>ownerIds", existBoard?.ownerIds, "adminId", adminId);
  const isAdmin = existBoard?.ownerIds.includes(adminId);
  return isAdmin;
};

export const isBoardMember = async (
  boardId: string,
  memberId: string
): Promise<Boolean> => {
  const teamWorkspace = await BoardSchema.findById(boardId).exec();
  const checkMember = teamWorkspace?.memberIds.find((member: string) => {
    return member.toString() === memberId;
  });
  const checkOwner = teamWorkspace?.ownerIds.find((owner) => {
    return owner === memberId;
  });
  return !!checkOwner;
};

export const isCardNumber = async (
  cardId: string,
  userId: string
): Promise<Boolean> => {
  const card = await CardSchema.findById(cardId).exec();
  const checkMember = card?.memberIds.find((member: string) => {
    return member.toString() === userId;
  });
  return !!checkMember;
};

export const viewedBoardPermission = async (
  boardId: string,
  userId: string
): Promise<Boolean> => {
  const board = await BoardSchema.findById(boardId).exec();
  const workspaceId = await TeamWorkspaceSchema.findById(
    board?.teamWorkspaceId
  ).exec();
  const checkWorkspaceMember = await isWorkspaceMember(workspaceId?.id, userId);
  const checkBoardMember = await isBoardMember(board?.id, userId);
  if (await isSuperAdmin(workspaceId?.id, userId)) {
    return true;
  }
  return checkWorkspaceMember
    ? true
    : board?.type === MODE_ACCESS.private && checkBoardMember === false
    ? false
    : true;
};

export const viewWorkspacePermission = async (
  workspaceId: string,
  userId: string
): Promise<Boolean> => {
  const superAdmin = await isSuperAdmin(workspaceId, userId);
  const workspaceAdmin = await isWorkspaceAdmin(workspaceId, userId);
  const workspaceMember = await isWorkspaceMember(workspaceId, userId);
  return superAdmin || workspaceAdmin || workspaceMember;
};
export const permissionWorkspace = async (
  workspaceId: string,
  userId: string
): Promise<Boolean> => {
  const checkSuperAdmin = await isSuperAdmin(workspaceId, userId);
  const checkWorkspaceAdmin = await isWorkspaceAdmin(workspaceId, userId);
  return checkSuperAdmin || checkWorkspaceAdmin;
};
export const permissionBoard = async (
  boardId: string,
  userId: string
): Promise<Boolean> => {
  const board = await BoardSchema.findById(boardId).exec();
  const checkSuperAdmin = await isSuperAdmin(
    board?.teamWorkspaceId || "",
    userId
  );
  const checkBoardAdmin = await isBoardAdmin(board?.id, userId);
  return checkSuperAdmin || checkBoardAdmin;
};
export const permissionColumn = async (
  boardId: string,
  userId: string
): Promise<Boolean> => {
  const board = await BoardSchema.findById(boardId).exec();
  const checkSuperAdmin = await isSuperAdmin(
    board?.teamWorkspaceId || "",
    userId
  );
  const checkBoardAdmin = await isBoardAdmin(board?.id, userId);
  return checkSuperAdmin || checkBoardAdmin;
};
export const permissionCard = async (
  boardId: string,
  userId: string
): Promise<Boolean> => {
  const board = await BoardSchema.findById(boardId).exec();
  const checkSuperAdmin = await isSuperAdmin(
    board?.teamWorkspaceId || "",
    userId
  );
  const checkBoardAdmin = await isBoardAdmin(board?.id, userId);
  const checkBoardMember = await isBoardMember(board?.id, userId);
  return checkSuperAdmin || checkBoardAdmin || checkBoardMember;
};
