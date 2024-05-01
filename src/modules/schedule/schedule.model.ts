import {
  MODEL_NAME,
  SCHEDULE_TYPE,
  SCHEMA_TYPE,
  SUBTASK_STATUS,
} from "@core/utils";
import mongoose, { Query } from "mongoose";
import ISchedule from "./schedule.interface";
const ScheduleSchema = new mongoose.Schema({
  userId: {
    type: SCHEMA_TYPE,
    ref: MODEL_NAME.user,
    required: [true, "UserId is required"],
  },
  name: {
    type: String,
    minlength: [2, "Name task must be at least 2 characters long"],
    maxlength: [50, "Name task must be at most 50 characters long"],
    required: [true, "Name task is required"],
  },
  color: {
    type: String,
    pattern: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/],
    trim: true,
    default: "#1677FF",
  },
  type: {
    type: String,
    enum: [SCHEDULE_TYPE.assignedTask, SCHEDULE_TYPE.googleEvent],
    default: SCHEDULE_TYPE.assignedTask,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});
ScheduleSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const label = this;
    label.find({ isActive: { $ne: false } }).select("-__v");
  }
  next();
});
export default mongoose.model<ISchedule & mongoose.Document>(
  MODEL_NAME.schedule,
  ScheduleSchema
);
