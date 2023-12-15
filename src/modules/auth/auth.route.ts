import { Route } from "@core/interfaces";
import { NextFunction, Request, Response, Router } from "express";
import AuthController from "./auth.controller";
import { authMiddleware, validationMiddleware } from "@core/middleware";
import ForgotDto from "./dtos/forgot.dto";
import AuthDto from "./auth.dto";
import ResetDto from "./dtos/reset.dto";
import passport, { Profile } from "passport";
import { UserSchema } from "@modules/users";

export default class AuthRoute implements Route {
  public path = "/api/v1/auth";
  public router = Router();

  public authController = new AuthController();

  constructor() {
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.post(
      this.path,
      validationMiddleware(AuthDto, true),
      this.authController.loginUser
    );

    this.router.get(
      this.path,
      authMiddleware,
      this.authController.getCurrentLoginUser
    );

    this.router.post(
      this.path + "/forgot-password",
      validationMiddleware(ForgotDto, true),
      this.authController.forgotPassword
    );

    this.router.patch(
      this.path + "/reset-password",
      validationMiddleware(ResetDto, true),
      this.authController.resetPassword
    );

    this.router.get(
      this.path + "/refresh-token",
      this.authController.refreshToken
    );

    this.router.get(this.path + "/logout", this.authController.logOut);

    this.router.get(
      this.path + "/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
      })
    );

    this.router.get(
      this.path + "/google/callback",
      (req, res, next) => {
        passport.authenticate("google", async (err: any, profile: any) => {
          const user = await UserSchema.findOne({
            email: profile?.emails?.[0]?.value || "",
          });
          if (!req.user) {
            req.user = { id: "", tokenLogin: "" };
          }
          req.user.id = user?.id;
          req.user.tokenLogin = profile?.tokenLogin;
          next();
        })(req, res, next);
      },
      (req, res) => {
        res.redirect(`${process.env.URL_CLIENT}/login-success/${req.user?.id}/${req.user?.tokenLogin}`);
      }
    );
    this.router.post(
      this.path + "/login-success",
      this.authController.handleLoginSuccess
    )
  };
  
}
