import "dotenv/config";
import App from "./app";
import { IndexRoute } from "@modules/index";
import { validateEnv } from "@core/utils";
import { UsersRoute } from "@modules/users";
import { AuthRoute } from "@modules/auth";
import { OTPRoute } from "@modules/otp";
import { EmailVerificationRoute } from "@modules/email_verification";
import { TeamWorkspaceRoute } from "@modules/teamWorkspace";
import { BoardRoute } from "@modules/boards";
import { ColumnRoute } from "@modules/columns";
import { CardRoute } from "@modules/cards";
import { LabelRoute } from "@modules/labels";
import { InvitationRoute } from "@modules/invitations";
import { SubCardRoute } from "@modules/sub_cards";
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
  new SubCardRoute()
];
const app = new App(routes);
app.listen();
