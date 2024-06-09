import mongoose from "mongoose";
export const MODE_ACCESS = {
  public: "public",
  private: "private",
};
export const OBJECT_ID = mongoose.Types.ObjectId;
export const SCHEMA_TYPE = mongoose.Schema.ObjectId;
export const PRIORITY = {
  lowest: "lowest",
  low: "low",
  medium: "medium",
  high: "high",
  highest: "highest",
};
export const AVATAR_DEFAULT =
  "https://firebasestorage.googleapis.com/v0/b/nover-task-b511e.appspot.com/o/avatar-default.png?alt=media&token=80691c07-1acd-42f2-9e2b-de82476a09c6";
export const MAX_SIZE_IMAGE = 2 * 1024 * 1024;
export const INVITE_STATUS = {
  pending: "pending",
  accepted: "accepted",
  rejected: "rejected",
};
export const MODEL_NAME = {
  user: "User",
  board: "Board",
  card: "Card",
  column: "Column",
  invitationWorkspace: "InvitationWorkspace",
  teamWorkspace: "TeamWorkspace",
  label: "Label",
  otp: "Otp",
  subCard: "SubCard",
  notification: "Notification",
  schedule: "Schedule",
  boardPermission: "BoardPermission",
  workspacePermission: "WorkspacePermission",
  sprint: "Sprint",
  columnStatus: "ColumnStatus",
  issueType: "IssueType",
  priority: "Priority",
  taskLog: "TaskLog",
  issueLink: "IssueLink",
  epic: "Epic",
  issueLinkType: "IssueLinkType",
};
export const SUBTASK_STATUS = {
  todo: "todo",
  inprogress: "inprogress",
  completed: "completed",
  cancel: "cancel",
};
export const ROLE = {
  superAdmin: "superAdmin",
  admin: "admin",
  boardLead: "boardLead",
  boardAdmin: "boardAdmin",
  member: "member",
};

export const SCHEDULE_TYPE = {
  assignedTask: "assignedTask",
  googleEvent: "googleEvent",
};

export const PERM_TYPE = {
  board: "board",
  workspace: "workspace",
};

export const BOARD_TEMPLATE = {
  kanban: "kanban",
  scrum: "scrum",
};

export const SPRINT_STATUS = {
  pending: "pending",
  active: "active",
  completed: "completed",
  backlog: "backlog",
};

export const SPRINT_DURATION = {
  oneWeek: "1 week",
  twoWeeks: "2 weeks",
  threeWeeks: "3 weeks",
  fourWeeks: "4 weeks",
  custom: "custom",
};

export const DIRECTION_TYPE = {
  inward: "inward",
  outward: "outward",
};
