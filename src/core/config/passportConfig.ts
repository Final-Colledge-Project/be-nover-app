import { HttpException } from "@core/exceptions";
import { UserSchema } from "@modules/users";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { uuid } from "uuidv4";
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
    },
    async (accessToken, refreshToken, profile : any, cb) => {
      const checkExist = await UserSchema.findOne({
        email: profile.emails![0].value,
      });
      const uuidv4 = uuid();
      profile!.tokenLogin = uuidv4;
      try {
        if (checkExist) {
          await UserSchema.findOneAndUpdate(
            {
              email: profile.emails![0].value,
            },
            {
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              avatar: profile.photos![0].value,
              profileLogin: {
                tokenLogin: uuidv4,
              },
            }
          );
        } else {
          const user = new UserSchema({
            email: profile.emails![0].value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            avatar: profile.photos![0].value,
            verify: profile.emails![0].verified,
            profileLogin: {
              id: profile.id,
              provider: profile.provider,
              tokenLogin: uuidv4,
            },
          });

          await user.save({ validateBeforeSave: false });
        }
      } catch (err: any) {
        throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, err.message);
      }
      return cb(null, profile);
    }
  )
);
