import { MODEL_NAME, SCHEMA_TYPE } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IIssueLink from "./issueLink.interface";

const IssueLinkSchema = new mongoose.Schema(
  {
    sourceIssue: {
      issueModel: {
        type: String,
        required: [true, "IssueModelFrom is required"],
        enum: [MODEL_NAME.card, MODEL_NAME.epic, MODEL_NAME.subCard],
      },
      issueId: {
        type: SCHEMA_TYPE,
        refPath: "sourceIssueModel",
        required: [true, "IssueIdFrom is required"],
      },
    },
    targetIssue: [
      {
        issueModel: {
          type: String,
          required: [true, "IssueModelTo is required"],
          enum: [MODEL_NAME.card, MODEL_NAME.epic, MODEL_NAME.subCard],
        },
        issueId: {
          type: SCHEMA_TYPE,
          refPath: "targetIssueModel",
          required: [true, "IssueIdTo is required"],
        },
      },
    ],
    linkIssueTypeId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.issueLinkType,
      required: [true, "LinkIssueTypeId is required"],
    },
  },
  { timestamps: true }
);

IssueLinkSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const issueLink = this;
    issueLink.find({ active: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<IIssueLink & mongoose.Document>(
  MODEL_NAME.issueLink,
  IssueLinkSchema
);
