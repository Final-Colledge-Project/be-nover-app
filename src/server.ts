import "dotenv/config";
import App from "./app";
import { IndexRoute } from "@modules/index";
import { validateEnv } from "@core/utils";
import { UsersRoute } from "@modules/users";
import { AuthRoute } from "@modules/auth";
import { OTPRoute } from "@modules/otp";
import { EmailVerificationRoute } from "@modules/email_verification";

validateEnv();

const routes = [
  new IndexRoute(),
  new UsersRoute(), 
  new AuthRoute(),
  new OTPRoute(),
  new EmailVerificationRoute()
];

const app = new App(routes);

app.listen();
