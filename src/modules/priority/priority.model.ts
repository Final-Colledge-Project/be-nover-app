import { MODEL_NAME, OBJECT_ID } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IPriority from "./priority.interface";

const PrioritySchema = new mongoose.Schema(
  {
    boarId: {
      type: OBJECT_ID,
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
    icon: {
      type: String,
      default: "",
      required: [true, "Icon is required"],
    },
    color: {
      type: String,
      pattern: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/],
      trim: true,
      default: "#1677FF",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

PrioritySchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const priority = this;
    priority.find({ active: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<IPriority & mongoose.Document>(
  MODEL_NAME.priority,
  PrioritySchema
);
