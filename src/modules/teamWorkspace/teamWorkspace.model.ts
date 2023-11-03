import mongoose from "mongoose";
import validator from "validator";
import { Query } from "mongoose";
import ITeamWorkspace from "./teamWorkspace.interface";

const TeamWorkspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [20, "Name must be at most 20 characters long"],
    trim: true,
  },
  workspaceAdmin: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  memberList: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
})

TeamWorkspaceSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
      const teamWorkspace = this;
      teamWorkspace.find({ active: { $ne: false } }).select('-__v');
  }
  next();
});

export default mongoose.model<ITeamWorkspace & mongoose.Document>("TeamWorkspace", TeamWorkspaceSchema);