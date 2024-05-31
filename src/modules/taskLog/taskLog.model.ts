import { MODEL_NAME, SCHEMA_TYPE } from "@core/utils";
import mongoose, { Query } from "mongoose";
import ITaskLog from "./taskLog.interface";
const TaskLogSchema = new mongoose.Schema(
  {
    userId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.user,
      required: [true, "UserId is required"],
    },
    target: {
      type: String,
      default: null,
    },
    msg: {
      type: String,
      minlength: [2, "Message must be at least 2 characters long"],
      maxlength: [100, "Message must be at most 100 characters long"],
      required: [true, "Message is required"],
    },
    oldVal: {
      type: String,
      default: null,
    },
    newVal: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
TaskLogSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const taskLog = this;
    taskLog.find({ isActive: { $ne: false } }).select("-__v");
  }
  next();
});
export default mongoose.model<ITaskLog & mongoose.Document>(
  MODEL_NAME.taskLog,
  TaskLogSchema
);
