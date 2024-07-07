import mongoose, { Query } from "mongoose";
import {
  MODEL_NAME,
  SCHEMA_TYPE,
  SPRINT_DURATION,
  SPRINT_STATUS,
} from "@core/utils";
import ISprint from "./sprint.interface";

const SprintSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODEL_NAME.board,
      required: [true, "BoardId is required"],
    },
    name: {
      type: String,
      minLength: [2, "Name sprint must be at least 2 characters long"],
      maxLength: [50, "Name sprint must be at most 50 characters long"],
      required: [true, "Name is required"],
    },
    cardOrderIds: [
      {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.card,
      },
    ],
    duration: {
      type: String,
      enum: [
        SPRINT_DURATION.oneWeek,
        SPRINT_DURATION.twoWeeks,
        SPRINT_DURATION.threeWeeks,
        SPRINT_DURATION.fourWeeks,
        SPRINT_DURATION.custom,
      ],
      default: SPRINT_DURATION.custom,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODEL_NAME.user,
      required: [true, "CreatorId is required"],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    goal: {
      type: String,
      minLength: [2, "Goal must be at least 2 characters long"],
      maxLength: [200, "Goal must be at most 200 characters long"],
    },
    status: {
      type: String,
      enum: Object.values(SPRINT_STATUS),
      default: SPRINT_STATUS.pending,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dailyStoryPoints: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        storyPoints: {
          type: Number,
          default: 0,
        },
      },
    ],
    actualCompletedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

SprintSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const sprint = this;
    sprint.find({ isActive: { $ne: false } }).select("-__v");
  }
  next();
});
export default mongoose.model<ISprint & mongoose.Document>(
  MODEL_NAME.sprint,
  SprintSchema
);
