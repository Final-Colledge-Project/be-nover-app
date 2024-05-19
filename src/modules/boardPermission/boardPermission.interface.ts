export default interface IBoardPermission {
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
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  member: {
    viewAll: boolean;
    invite: boolean;
  };
  issueType: {
    viewAll: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  priority: {
    viewAll: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  label: {
    viewAll: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isAdmin: boolean;
  isViewer: boolean;
}
