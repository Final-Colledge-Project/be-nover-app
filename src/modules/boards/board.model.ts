import mongoose, { Query } from "mongoose";
import IBoard from "./board.interface";
import { MODEL_NAME, MODE_ACCESS, SCHEMA_TYPE } from "@core/utils";

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
  cover: {
    type: String,
    default: null,
  },
  columnOrderIds: [
    {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.column
    }
  ],
  type: {
    type: String,
    enum: [MODE_ACCESS.public, MODE_ACCESS.private],
    default: MODE_ACCESS.private
  },
  teamWorkspaceId: {
    type: SCHEMA_TYPE,
    ref: MODEL_NAME.teamWorkspace
  },
  ownerIds: [{
    type: SCHEMA_TYPE,
    ref: MODEL_NAME.user
  }],
  memberIds: [
    {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.user
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
BoardSchema.index({ "title": "text"})

BoardSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
      const label = this;
      label.find({ isActive: { $ne: false } }).select('-__v');
  }
  next();
});


export default mongoose.model<IBoard & mongoose.Document>(MODEL_NAME.board, BoardSchema);