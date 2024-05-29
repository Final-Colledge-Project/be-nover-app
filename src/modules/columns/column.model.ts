import mongoose, { Query } from "mongoose";
import IColumn from "./column.interface";
import { MODEL_NAME, OBJECT_ID, SCHEMA_TYPE } from "@core/utils";
const ColumnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [20, "Title must be at most 20 characters long"],
      trim: true,
    },
    boardId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.board,
    },
    cardOrderIds: [
      {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.card,
      },
    ],
    columnStatusId: {
      type: OBJECT_ID,
      ref: MODEL_NAME.columnStatus,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      pattern: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/],
      trim: true,
      default: "#1677FF",
    },
    description: {
      type: String,
      minlength: [3, "Description must be at least 3 characters long"],
      maxlength: [300, "Description must be at most 300 characters long"],
      trim: true,
      default: "",
    },
    WIP: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
ColumnSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const col = this;
    col.find({ isActive: { $ne: false } }).select("-__v");
  }
  next();
});
export default mongoose.model<IColumn & mongoose.Document>(
  MODEL_NAME.column,
  ColumnSchema
);
