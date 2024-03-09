import mongoose from "mongoose";
import validator from "validator";
import IEmailVerify from "./emailVerify.interface";
const EmailVerifySchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    validate: [validator.isEmail, "Email is invalid"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model<IEmailVerify & mongoose.Document>(
  "EmailVerify",
  EmailVerifySchema
);
