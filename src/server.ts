import "dotenv/config";
import App from "./app";
import { IndexRoute } from "@modules/index";
import { validateEnv } from "@core/utils";
import { UsersRoute } from "@modules/users";
import { AuthRoute } from "@modules/auth";
import { OTPRoute } from "@modules/otp";
import { EmailVerificationRoute } from "@modules/emailVerifications";
import { TeamWorkspaceRoute } from "@modules/teamWorkspaces";
import { BoardRoute } from "@modules/boards";
import { ColumnRoute } from "@modules/columns";
import { CardRoute } from "@modules/cards";
import { LabelRoute } from "@modules/labels";
import { InvitationRoute } from "@modules/invitations";
import { SubCardRoute } from "@modules/subCards";
import { NotificationRoute } from "@modules/notifications";
import { ScheduleRoute } from "@modules/schedules";
import { BoardPermissionRoute } from "@modules/boardPermissions";
import { WorkspacePermissionRoute } from "@modules/workspacePermissions";
import { SprintRoute } from "@modules/sprints";
import { EpicRoute } from "@modules/epics";
import { TaskLogRoute } from "@modules/taskLogs";
import { IssueLinkRoute } from "@modules/issueLinks";
import { IssueLinkTypeRoute } from "@modules/issueLinkTypes";
import { IssueTypeRoute } from "@modules/issueTypes";
import { StatisticRoute } from "@modules/statistics";
import { PriorityRoute } from "@modules/priorities";
validateEnv();
const routes = [
  new IndexRoute(),
  new UsersRoute(),
  new AuthRoute(),
  new OTPRoute(),
  new EmailVerificationRoute(),
  new TeamWorkspaceRoute(),
  new BoardRoute(),
  new ColumnRoute(),
  new CardRoute(),
  new LabelRoute(),
  new InvitationRoute(),
  new SubCardRoute(),
  new NotificationRoute(),
  new ScheduleRoute(),
  new BoardPermissionRoute(),
  new WorkspacePermissionRoute(),
  new SprintRoute(),
  new EpicRoute(),
  new TaskLogRoute(),
  new IssueLinkRoute(),
  new IssueLinkTypeRoute(),
  new IssueTypeRoute(),
  new StatisticRoute(),
  new PriorityRoute(),
];
const app = new App(routes);
app.listen();
