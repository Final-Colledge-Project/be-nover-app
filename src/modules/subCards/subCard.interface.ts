export default interface ISubCard {
  _id: string;
  cardId: string;
  name: string;
  status: string;
  assignedTo: string | null;
  issueTypeId: string;
  priorityId: string;
  startDate: Date;
  createdAt: Date;
  dueDate: Date;
  updatedAt: Date;
  isActive: boolean;
}
