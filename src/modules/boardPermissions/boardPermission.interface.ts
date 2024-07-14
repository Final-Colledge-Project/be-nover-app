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
  sprint: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  epic: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  issueLinkType: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  report: {
    create: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  direction: IDirection[];
}

export interface IDirection {
  _id?: string;
  name: string;
  sourceColumnId: string;
  targetColumnId: string;
}
