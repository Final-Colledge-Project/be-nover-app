import mongoose from "mongoose";
import IUser from "./user.interface";
import validator from "validator";
import { Query } from "mongoose";
import { AVATAR_DEFAULT } from "@core/utils";
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    minlength: [2, "First name must be at least 2 characters long"],
    maxlength: [20, "First name must be at most 20 characters long"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    minlength: [2, "Last name must be at least 2 characters long"],
    maxlength: [20, "Last name must be at most 20 characters long"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    validate: [validator.isEmail, "Email is invalid"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
  phone: {
    type: String,
    default: null,
    trim: true,
    unique: true,
    length: [10, "Phone must be at least 10 characters long"],
  },
  birthDate: {
    type: Date,
    default: null,
    trim: true,
  },
  address: {
    type: String,
    default: null,
    trim: true,
  },
  avatar: {
    type: String,
    default: AVATAR_DEFAULT,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    select: false,
  },
  refreshToken: {
    type: [String],
    select: false,
  },
  profileLogin: {
    id: {
      type: String,
      default: null,
      select: false,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    tokenLogin: {
      type: String,
      default: null,
      select: false,
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
UserSchema.index({ email: 1 });
UserSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const user = this;
    user
      .find({ active: { $ne: false }, verify: { $ne: false } })
      .select("-__v");
  }
  next();
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

export default mongoose.model<IUser & mongoose.Document>("User", UserSchema);
