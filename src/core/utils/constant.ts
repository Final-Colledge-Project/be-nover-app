import mongoose from "mongoose";
export const MODE_ACCESS = {
  public: 'public',
  private: 'private'
}
export const OBJECT_ID = mongoose.Types.ObjectId;
export const SCHEMA_TYPE = mongoose.Schema.ObjectId;
export const PRIORITY = {
  lowest: 'lowest',
  low: 'low',
  medium: 'medium',
  high: 'high',
  highest: 'highest'
}
export const AVATAR_DEFAULT = "https://firebasestorage.googleapis.com/v0/b/nover-task-b511e.appspot.com/o/avatar-default.png?alt=media&token=80691c07-1acd-42f2-9e2b-de82476a09c6";
export const MAX_SIZE_IMAGE = 2 * 1024 * 1024;
export const INVITE_STATUS = {
  pending: 'pending',
  accepted: 'accepted',
  rejected: 'rejected'
}
export const MODEL_NAME = {
  user: 'User',
  board: 'Board',
  card: 'Card',
  column: 'Column',
  invitationWorkspace: 'InvitationWorkspace',
  teamWorkspace: 'TeamWorkspace',
  label: 'Label',
  otp: 'Otp',
}