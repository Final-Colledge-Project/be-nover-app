import { google } from "googleapis";
import * as path from "path";
import * as fs from "fs/promises";
import { authenticate } from "@google-cloud/local-auth";
import { UserSchema } from "@modules/users";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { Request, Response } from "express";
import { isJsonString } from "@core/utils";
import { GoogleEvent } from "./schedule.type";
import { uuid } from "uuidv4";
export default class ScheduleService {
  private userSchema = UserSchema;
  private auth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CLIENT_REDIRECT
  );
  private client = new OAuth2Client(process.env.CLIENT_ID);
  private calendar = google.calendar({
    version: "v3",
    auth: process.env.GOOGLE_CALENDAR_API_KEY,
  });
  public async getGoogleCalendar(userId: string): Promise<GoogleEvent[]> {
    console.log("🚀 ~ ScheduleService ~ getGoogleCalendar ~ userId:", userId);
    const user = await this.userSchema
      .findById(userId)
      .select("tokenSyncGoogle")
      .exec();
    if (!user) {
      throw new HttpException(StatusCodes.BAD_REQUEST, `User is not exits`);
    }
    if (user.tokenSyncGoogle.token) {
      const token = isJsonString(user.tokenSyncGoogle.token)
        ? JSON.parse(user.tokenSyncGoogle.token)
        : user.tokenSyncGoogle.token;
      this.auth2Client.setCredentials(token);
    }
    const result = await this.calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: "startTime",
      auth: this.auth2Client,
    });
    const events = result.data.items;
    console.log("🚀 ~ ScheduleService ~ getGoogleCalendar ~ events:", events);
    if (!events || events.length === 0) {
      console.log("No upcoming events found.");
      return [];
    }
    console.log("Upcoming 10 events:");
    const eventList = events.map((event, i) => {
      return {
        id: event.id || uuid(),
        start: event?.start?.dateTime || "",
        end: event?.end?.dateTime || "",
        summary: event.summary || "",
        htmlLink: event.htmlLink || "",
      };
    });
    return eventList || [];
  }
  public async verifyGoogleToken(currentUserId: string): Promise<boolean> {
    console.log(
      "🚀 ~ ScheduleService ~ verifyGoogleToken ~ currentUserId:",
      currentUserId
    );
    const user = await this.userSchema
      .findById(currentUserId)
      .select("tokenSyncGoogle")
      .exec();
    if (!user) {
      throw new HttpException(StatusCodes.BAD_REQUEST, `User is not exits`);
    }
    if (user.tokenSyncGoogle.token) {
      try {
        const tokenInfo = await axios.get(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${
            JSON.parse(user.tokenSyncGoogle.token).access_token
          }`
        );
        if (tokenInfo.status === 200) {
          return true;
        }
        return false;
      } catch (error) {
        console.error("Invalid ID Token: ", error);
        return false;
      }
    } else {
      return false;
    }
  }
}
