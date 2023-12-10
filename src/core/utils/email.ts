import nodemailer from "nodemailer";
import Logger from "./logger";
import { IUser } from "@modules/users";
import pug from "pug";
import { convert } from "html-to-text";
import { IInvitationWorkspace } from "@modules/invitations";

export class Email {
  constructor(
    user: IUser,
    url: string,
    subUser?: IUser,
    invitation?: IInvitationWorkspace
  ) {
    this.to = user.email;
    this.name = user.lastName + " " + user.firstName;
    this.url = url;
    this.from = `NoverTask <${process.env.AUTH_USERNAME}>`!;
    this.subName = subUser?.lastName + " " + subUser?.firstName;
    this.invitation = invitation;
  }
  private to: string;
  private name: string;
  private url: string;
  private from: string;
  private subName?: string;
  private invitation?: IInvitationWorkspace;
  newTransport() {
    return nodemailer.createTransport({
      // service: "gmail",
      // host: "smtp-mail.outlook.com",
      host: "sandbox.smtp.mailtrap.io",
      auth: {
        user: process.env.AUTH_USERNAME,
        pass: process.env.AUTH_PASSWORD,
      },
    });
  }

  async send(template: string, subject: string) {
    //Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../../views/email/${template}.pug`,
      {
        name: this.name,
        url: this.url,
        subject,
        subUser: this.name,
        subName: this.subName,
        invitation: this.invitation?._id,
      }
    );
    //Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    //Create a transport and send mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("Welcome", "Welcome to the NoverTask!");
  }

  async sendInvitationMember() {
    await this.send(
      "confirmJoinTeam",
      `👋 ${this.subName} invited you to join them in NoverTask`
    );
  }
}

let transporter = nodemailer.createTransport({
  // host: 'smtp-mail.outlook.com',
  host: "sandbox.smtp.mailtrap.io",
  // service: "gmail",
  // host: "smtp-mail.outlook.com",
  auth: {
    user: process.env.AUTH_USERNAME,
    pass: process.env.AUTH_PASSWORD,
  },
});

//test transporter
transporter.verify((error, success) => {
  if (error) {
    Logger.error(error);
  } else {
    Logger.info("Ready to send email");
  }
});

const sendEmail = async (mailOptions: object) => {
  try {
    await transporter.sendMail(mailOptions);
    return;
  } catch (err) {
    throw err;
  }
};

export default sendEmail;
