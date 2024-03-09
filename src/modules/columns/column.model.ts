import mongoose, { Query } from "mongoose";
import IColumn from "./column.interface";
import { MODEL_NAME, SCHEMA_TYPE } from "@core/utils";
const ColumnSchema = new mongoose.Schema({
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
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  }
});
ColumnSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
      const label = this;
      label.find({ isActive: { $ne: false } }).select('-__v');
  }
  next();
});
export default mongoose.model<IColumn & mongoose.Document>(MODEL_NAME.column, ColumnSchema);