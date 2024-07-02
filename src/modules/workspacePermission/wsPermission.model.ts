import { MODEL_NAME, SCHEMA_TYPE } from "@core/utils";
import mongoose, { Query } from "mongoose";
import IWorkspacePermission from "./wsPermission.interface";

const WorkspacePermissionSchema = new mongoose.Schema(
  {
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
    workspaceId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.teamWorkspace,
      required: [true, "Workspace is required"],
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
    board: {
      viewAll: {
        type: Boolean,
        default: true,
      },
      create: {
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
    isActive: {
      type: Boolean,
      default: true,
    },
    isWSAdmin: {
      type: Boolean,
      default: false,
    },
    isWSViewer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

WorkspacePermissionSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const wsPermission = this;
    wsPermission.find({ isActive: { $ne: false } }).select("-__v");
  }
  next();
});
export default mongoose.model<IWorkspacePermission & mongoose.Document>(
  MODEL_NAME.workspacePermission,
  WorkspacePermissionSchema
);
