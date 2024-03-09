import mongoose from "mongoose";
import { Query } from "mongoose";
import ITeamWorkspace from "./teamWorkspace.interface";
import { MODEL_NAME, SCHEMA_TYPE } from "@core/utils";
const TeamWorkspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [30, "Name must be at most 30 characters long"],
    trim: true,
  },
  workspaceAdmins: [
    {
      user: {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.user,
      },
      role: {
        type: String,
        enum: ["superAdmin", "admin"],
        default: "admin",
      },
    },
  ],
  workspaceMembers: [
    {
      user: {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.user,
      },
      joinDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

TeamWorkspaceSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const teamWorkspace = this;
    teamWorkspace.find({ active: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<ITeamWorkspace & mongoose.Document>(
  MODEL_NAME.teamWorkspace,
  TeamWorkspaceSchema
);
