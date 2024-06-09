import "dotenv/config";
import App from "./app";
import { IndexRoute } from "@modules/index";
import { validateEnv } from "@core/utils";
import { UsersRoute } from "@modules/users";
import { AuthRoute } from "@modules/auth";
import { OTPRoute } from "@modules/otp";
import { EmailVerificationRoute } from "@modules/emailVerification";
import { TeamWorkspaceRoute } from "@modules/teamWorkspace";
import { BoardRoute } from "@modules/boards";
import { ColumnRoute } from "@modules/columns";
import { CardRoute } from "@modules/cards";
import { LabelRoute } from "@modules/labels";
import { InvitationRoute } from "@modules/invitations";
import { SubCardRoute } from "@modules/subCards";
import { NotificationRoute } from "@modules/notifications";
import { ScheduleRoute } from "@modules/schedule";
import { BoardPermissionRoute } from "@modules/boardPermission";
import { WorkspacePermissionRoute } from "@modules/workspacePermission";
import { SprintRoute } from "@modules/sprint";
import { EpicRoute } from "@modules/epic";
import { TaskLogRoute } from "@modules/taskLog";
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
];
const app = new App(routes);
app.listen();
