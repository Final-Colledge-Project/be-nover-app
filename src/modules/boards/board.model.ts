import mongoose from "mongoose";
import IBoard from "./board.interface";
import { SCHEMA_TYPE } from "@core/utils";

const BoardSchema = new mongoose.Schema({
  title : {
    type: String,
    required: [true, "Title is required"],
    minlength: [3, "Title must be at least 3 characters long"],
    maxlength: [30, "Title must be at most 30 characters long"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    minlength: [2, "Description must be at least 2 characters long"],
    maxlength: [100, "Description must be at most 100 characters long"],
    trim: true,
  },
  columnOrderIds: [
    {
      type: SCHEMA_TYPE,
      ref: 'Column'
    }
  ],
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  teamWorkspaceId: {
    type: SCHEMA_TYPE,
    ref: 'TeamWorkspace'
  },
  ownerIds: [{
    type: SCHEMA_TYPE,
    ref: 'User'
  }],
  memberIds: [
    {
      type: SCHEMA_TYPE,
      ref: 'User'
    }
  ],
  columnIds: [
    {
      type: SCHEMA_TYPE,
      ref: 'Column'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  isDestroyed: {
    type: Boolean,
    default: false,
    select: false
  }
})

export default mongoose.model<IBoard & mongoose.Document>('Board', BoardSchema);