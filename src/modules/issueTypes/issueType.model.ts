import { MODEL_NAME, OBJECT_ID, SCHEMA_TYPE } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IIssueType from "./issueType.interface";

const IssueTypeSchema = new mongoose.Schema(
  {
    boardId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.board,
      required: [true, "BoardId is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },
    description: {
      type: String,
      maxlength: [300, "Description must be at most 300 characters long"],
      trim: true,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    hierarchy: {
      type: Number,
      default: 2,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

IssueTypeSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const issueType = this;
    issueType.find({ active: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<IIssueType & mongoose.Document>(
  MODEL_NAME.issueType,
  IssueTypeSchema
);
