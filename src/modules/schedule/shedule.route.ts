import { Route } from "@core/interfaces";
import { authMiddleware } from "@core/middleware";
import { Router } from "express";
import ScheduleController from "./schedule.controller";
import { google } from "googleapis";
import axios from "axios";

export default class ScheduleRoute implements Route {
  public path = "/api/v1/schedule";
  public router = Router();
  public scheduleController = new ScheduleController();
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
    this.router.get(this.path + "/google/calendar", (req, res) => {
      const url = this.auth2Client.generateAuthUrl({
        access_type: "offline",
        scope: this.scope,
      });
      res.redirect(url);
    });
    this.router.get(this.path + "/google/redirect", async (req, res) => {
      const code = req.query.code;
      const { tokens } = await this.auth2Client.getToken(code as string);
      this.auth2Client.setCredentials(tokens);
      console.log(
        "🚀 ~ ScheduleRoute ~ this.router.get ~ touser_info:"
        // user_info.data
      );
      res.send("It works!");
    });
    this.router.get(this.path + "/google/calendar/events", async (req, res) => {
      console.log( 
        "~~~~~~~~>access_token:",
        this.auth2Client.credentials.access_token
      );
      const result = await this.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
        auth: this.auth2Client,
      });
      const events = result.data.items;
      if (!events || events.length === 0) {
        console.log("No upcoming events found.");
        return;
      }
      console.log("Upcoming 10 events:");
      events.map((event, i) => {
        const start = event?.start?.dateTime || event?.start?.date;
        console.log(`${start} - ${event.summary}`);
      });
      res.send("Done");
    });
  }
}
