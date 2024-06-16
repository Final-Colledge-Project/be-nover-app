import { MODEL_NAME, SCHEMA_TYPE } from "@core/utils";
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
      maxlength: [300, "Description must be at most 300 characters long"],
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    cardOrderIds: [
      {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.card,
      },
    ],
    color: {
      type: String,
      pattern: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/],
      trim: true,
      default: "#3634A3",
    },
    preEpicId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.epic,
      default: null,
    },
    nextEpicId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.epic,
      default: null,
    },
    columnId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.column,
      required: [true, "ColumnId is required"],
    },
    assigneeId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.user,
      default: null,
    },
    labelId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.label,
      default: null,
    },
    comments: [
      {
        user: {
          type: SCHEMA_TYPE,
          ref: MODEL_NAME.user,
          required: [true, "User is required"],
        },
        email: {
          type: String,
          required: [true, "Email is required"],
        },
        avatar: {
          type: String,
          required: [true, "Avatar is required"],
        },
        displayName: {
          type: String,
          required: [true, "DisplayName is required"],
        },
        content: {
          type: String,
          required: [true, "Content is required"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        fileName: {
          type: String,
          required: [true, "FileName is required"],
        },
        fileType: {
          type: String,
          required: [true, "FileType is required"],
        },
        fileUrl: {
          type: String,
          required: [true, "FileUrl is required"],
        },
        createAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    issueTypeId: {
      type: SCHEMA_TYPE,
      required: [true, "IssueTypeId is required"],
      ref: MODEL_NAME.issueType,
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
