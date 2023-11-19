export default interface ICard {
  _id: string;
  boardId: string;
  columnId: string;
  cardId: string;
  title: string;
  description: string;
  cover: string;
  startDate: Date;
  dueDate: Date;
  memberIds: string[];
  comments: IComment[];
  subTask: ISubTask[];
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
  reporterId: string;
  labelId: string;
  priority: string;
  isDone: boolean;
  isOverdue: boolean;
  isActive: boolean;
}

export interface IComment {
  user: string;
  email: string,
  avatar: string,
  displayName: string,
  content: string,
  createdAt: Date,
}

enum subTaskStatus {
  todo = 'todo',
  inprogress = 'inprogress',
  completed = 'completed',
  cancel = 'cancel'
}

export interface ISubTask {
  name: string,
  status: subTaskStatus,
  assignedTo: string,
  createAt: Date,
  dueDate: Date,
  updateAt: Date
}

export interface IAttachment {
  fileName: string,
  fileType: string,
  fileUrl: string,
  createAt: Date,
}

