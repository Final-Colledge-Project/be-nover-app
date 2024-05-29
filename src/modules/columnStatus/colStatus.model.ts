import { MODEL_NAME, OBJECT_ID } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IColumnStatus from "./colStatus.interface";

const ColumnStatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [30, "Name must be at most 30 characters long"],
      trim: true,
    },
    description: {
      type: String,
      minlength: [3, "Description must be at least 3 characters long"],
      maxlength: [300, "Description must be at most 300 characters long"],
      trim: true,
      default: "",  
    },
    color: {
      type: String,
      pattern: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/],
      trim: true,
      default: "#1677FF",
    },
    boardId: {
      type: OBJECT_ID,
      ref: MODEL_NAME.board,
      required: [true, "BoardId is required"],
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ColumnStatusSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const colStatus = this;
    colStatus.find({ active: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<IColumnStatus & mongoose.Document>(
  MODEL_NAME.columnStatus,
  ColumnStatusSchema
);
