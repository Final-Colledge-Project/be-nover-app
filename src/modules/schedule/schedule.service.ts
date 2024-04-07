import { google } from "googleapis";
export default class ScheduleService {
  public async getGoogleCalendar(tokenLogin: string): Promise<any> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const calendar = google.calendar({
      version: "v3",
      auth: process.env.GOOGLE_CALENDAR_API_KEY,
    });
    console.log(
      "🚀 ~ ScheduleService ~ getGoogleCalendar ~ tokenLogin:",
      tokenLogin
    );
    oauth2Client.setCredentials(JSON.parse(tokenLogin));
    console.log("~~~> oauth2Client", oauth2Client);
    const calendarId = "primary"; // Replace with specific calendar ID if needed
    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(), // Events from now
      maxResults: 10, // Limit to 10 events
      singleEvents: true, // Only return single events (not recurring)
      orderBy: "startTime", // Order by start time
    });
    console.log(
      "🚀 ~ ScheduleService ~ getGoogleCalendar ~ response:",
      response
    );
    const events = response.data.items;
    if (!events) return [];

    if (events.length) {
      console.log("Upcoming events:");
      events.forEach((event) => {
        const start = event?.start?.dateTime || event?.start?.date;
        console.log(`- ${start}: ${event.summary}`);
      });
    } else {
      console.log("No upcoming events found.");
    }
    return events;
  }
}
