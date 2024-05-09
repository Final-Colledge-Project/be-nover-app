export default interface IPermissionGroup {
  _id: string;
  name: string;
  description: string;
  boardId: string;
  color: string;
  memberIds: string[];
  column: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  card: {
    all: boolean;
  };
  member: {
    invite: boolean;
  };
  issueType: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  priority: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  label: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  isActive: boolean;
  isAdmin: boolean;
}
