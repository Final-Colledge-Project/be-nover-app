export default interface ISubCard {
  _id: string;
  cardId: string;
  name: string;
  status: string;
  assignedTo: string | null
  createdAt: Date;
  dueDate: Date;
  updatedAt: Date;
  isActive: boolean;
}
