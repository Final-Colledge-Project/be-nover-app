import mongoose, { Query } from "mongoose";

import { SCHEMA_TYPE } from "@core/utils";
import ITeamWorkspace from "./teamWorkspace.interface";
const TeamWorkspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [20, 'Name must be at most 20 characters long'],
    trim: true
  },
  workspaceAdmins: [
    {
      user: {
        type: SCHEMA_TYPE,
        ref: 'User',
    },
      role: {
        type: String,
        enum: ['superAdmin', 'admin'],
        default: 'admin',
    }
    }
  ],
  workspaceMembers: [
    {
      user: {
        type: SCHEMA_TYPE,
        ref: 'User',
    },
      joinDate: {
        type: Date,
        default: Date.now,
    },
  }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  invitedMembers: [
    {
      user: {
      type: SCHEMA_TYPE,
      ref: 'User',
    },
      requestDate: {
        type: Date,
        default: Date.now,
    },
      status: {
        type: String,
        enum: ['pending', 'accepted']
      }
    },
  }],
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

TeamWorkspaceSchema.pre(/^find/, async function(next) {
  if (this instanceof Query) {
    const teamWorkspace = this;
    teamWorkspace.find({active: {$ne: false}}).select('-__v');
  }
  next()
})

export default mongoose.model<ITeamWorkspace & mongoose.Document>('TeamWorkspace', TeamWorkspaceSchema)
