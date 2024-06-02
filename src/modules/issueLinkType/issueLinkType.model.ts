import { DIRECTION_TYPE, MODEL_NAME, SCHEMA_TYPE } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IIssueLinkType from "./issueLinkType.interface";

const IssueLinkTypeSchema = new mongoose.Schema(
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
    inwardName: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },
    outwardName: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },
    direction: {
      type: String,
      enum: Object.values(DIRECTION_TYPE),
      required: [true, "Direction is required"],
    },
  },
  { timestamps: true }
);

IssueLinkTypeSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const issueLinkType = this;
    issueLinkType.find({ active: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<IIssueLinkType & mongoose.Document>(
  MODEL_NAME.issueLinkType,
  IssueLinkTypeSchema
);
