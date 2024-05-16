import { MODEL_NAME, SCHEMA_TYPE } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IPermissionGroup from "./permissionGroup.interface";

const PermissionGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name must be at most 50 characters long"],
  },
  description: {
    type: String,
    minlength: [2, "Description must be at least 2 characters long"],
    maxlength: [255, "Description must be at most 255 characters long"],
  },
  boardId: {
    type: SCHEMA_TYPE,
    ref: MODEL_NAME.board,
    required: [true, "BoardId is required"],
  },
  color: {
    type: String,
    pattern: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/],
    trim: true,
    default: "#1677FF",
  },
  memberIds: [
    {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.user,
    },
  ],
  column: {
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  card: {
    all: {
      type: Boolean,
      default: false,
    },
  },
  member: {
    invite: {
      type: Boolean,
      default: false,
    },
  },
  issueType: {
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  priority: {
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  label: {
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  deletedAt: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

PermissionGroupSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const permissionGroup = this;
    permissionGroup.find({ isActive: { $ne: false } }).select("-__v");
  }
  next();
});
export default mongoose.model<IPermissionGroup & mongoose.Document>(
  MODEL_NAME.permissionGroup,
  PermissionGroupSchema
);
