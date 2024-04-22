import { Route } from "@core/interfaces";
import { authMiddleware } from "@core/middleware";
import { Router } from "express";
import ScheduleController from "./schedule.controller";
import { google } from "googleapis";
import axios from "axios";
import ScheduleService from "./schedule.service";
import { UserSchema } from "@modules/users";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";

export default class ScheduleRoute implements Route {
  public path = "/api/v1/schedule";
  public router = Router();
  public scheduleController = new ScheduleController();
  public scheduleService = new ScheduleService();
  private auth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CLIENT_REDIRECT
  );
  private scope = ["https://www.googleapis.com/auth/calendar"];
  constructor() {
    this.initializeRoute();
  }
  private calendar = google.calendar({
    version: "v3",
    auth: process.env.GOOGLE_CALENDAR_API_KEY,
  });

  private initializeRoute() {
    this.router.get(this.path + "/google/calendar/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const state = JSON.stringify({ userId: id });
        const url = this.auth2Client.generateAuthUrl({
          access_type: "offline",
          scope: this.scope,
          state: state,
        });
        res.redirect(url);
      } catch (err) {
        console.log(err);
      }
    });
    this.router.get(
      this.path + "/google/redirect",
      async (req, res) => {
        const code = req.query.code;
        const state = req.query.state;
        const { userId } = JSON.parse(state as string);
        const { tokens } = await this.auth2Client.getToken(code as string);
        this.auth2Client.setCredentials(tokens);
        const user = await UserSchema.findById(userId)
          .select("tokenSyncGoogle")
          .exec();
        if (!user) {
          throw new HttpException(StatusCodes.BAD_REQUEST, `User is not exits`);
        }
        user.tokenSyncGoogle.token = JSON.stringify(tokens);
        await user.save();
        res.send("<script>window.close();</script >");
      },
      this.scheduleController.getGoogleCalendar
    );
    this.router.get(
      this.path + "/google/calendar/events",
      this.scheduleController.getGoogleCalendar
    );
    this.router.get(
      this.path + "/google/verify-token",
      authMiddleware,
      this.scheduleController.verifyGoogleToken
    );
  }
}
