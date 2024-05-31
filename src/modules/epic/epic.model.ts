import { DIRECTION_ISSUE, MODEL_NAME, SCHEMA_TYPE } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IEpic from "./epic.interface";

const EpicSchema = new mongoose.Schema(
  {
    boardId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.board,
      required: [true, "BoardId is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },
    description: {
      type: String,
      minlength: [3, "Description must be at least 3 characters long"],
      maxlength: [300, "Description must be at most 300 characters long"],
      trim: true,
      default: "",
    },
    direction: {
      type: String,
      enum: Object.values(DIRECTION_ISSUE),
      required: [true, "Direction is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

EpicSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const epic = this;
    epic.find({ active: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<IEpic & mongoose.Document>(
  MODEL_NAME.epic,
  EpicSchema
);
