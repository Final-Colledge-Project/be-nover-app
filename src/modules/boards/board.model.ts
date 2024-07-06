import mongoose, { Query } from "mongoose";
import IBoard from "./board.interface";
import {
  MODEL_NAME,
  MODE_ACCESS,
  SCHEMA_TYPE,
  BOARD_TEMPLATE,
} from "@core/utils";

const BoardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [30, "Title must be at most 30 characters long"],
      trim: true,
    },
    key: {
      type: String,
      required: [true, "Key is required"],
      unique: true,
      minlength: [2, "Key must be at least 2 characters long"],
      maxlength: [10, "Key must be at most 10 characters long"],
      trim: true,
    },
    template: {
      type: String,
      enum: [BOARD_TEMPLATE.kanban, BOARD_TEMPLATE.scrum],
      required: [true, "Template is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
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
        ref: MODEL_NAME.column,
      },
    ],
    type: {
      type: String,
      enum: [MODE_ACCESS.public, MODE_ACCESS.private],
      default: MODE_ACCESS.public,
    },
    teamWorkspaceId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.teamWorkspace,
    },
    ownerIds: [
      {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.user,
      },
    ],
    memberIds: [
      {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.user,
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    defaultAssigneeId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.user,
      default: null,
    },
    initColumnId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.column,
    },
    nextAutoIncrement: {
      type: Number,
      default: 1,
    },
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5], // 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday
    },
  },
  { timestamps: true }
);
BoardSchema.index({ title: "text" });

BoardSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const label = this;
    label.find({ isActive: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<IBoard & mongoose.Document>(
  MODEL_NAME.board,
  BoardSchema
);
