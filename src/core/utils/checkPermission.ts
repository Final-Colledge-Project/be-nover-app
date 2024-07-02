import { BoardSchema } from "@modules/boards";
import { CardSchema } from "@modules/cards";
import { TeamWorkspaceSchema } from "@modules/teamWorkspace";
import {
  IMember,
  IWorkspaceAdmin,
} from "@modules/teamWorkspace/teamWorkspace.interface";
import { MODE_ACCESS, ROLE } from "./constant";
import { BoardPermissionSchema } from "@modules/boardPermission";
import { WorkspacePermissionSchema } from "@modules/workspacePermission";

export const isWorkspaceAdmin = async (
  teamWorkspaceId: string,
  adminId: string
): Promise<Boolean> => {
  const teamWorkspace = await TeamWorkspaceSchema.findById(
    teamWorkspaceId
  ).exec();
  if (!teamWorkspace) return false;
  const adminPermission = await WorkspacePermissionSchema.findOne({
    workspaceId: teamWorkspaceId,
    isWSAdmin: true,
  }).exec();
  const isInPerm = adminPermission?.memberIds.find((mem) => mem.toString() === adminId.toString());
  if (!isInPerm) return false;
  return true;
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
  const existBoard = await BoardSchema.findById(boardId).exec();
  if (!existBoard) return false;
  const adminPermission = await BoardPermissionSchema.findOne({
    boardId: boardId,
    isAdmin: true,
  }).exec();
  const isInPerm = adminPermission?.memberIds.find((mem) => mem.toString() === adminId.toString());
  if (!isInPerm) return false;
  return true;
};

export const isBoardMember = async (
  boardId: string,
  memberId: string
): Promise<Boolean> => {
  const board = await BoardSchema.findById(boardId).exec();
  const checkMember = board?.memberIds.find((member: string) => {
    return member.toString() === memberId;
  });
  const checkOwner = board?.ownerIds.find((owner) => {
    return owner.toString() === memberId;
  });
  // if (!checkMember && !checkOwner) {
  //   return false;
  // }
  return !!checkMember || !!checkOwner;
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
