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
export default class ScheduleService {}
