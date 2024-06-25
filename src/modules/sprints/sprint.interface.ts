export default interface ISprint {
  _id: string;
  boardId: string;
  name: string;
  cardOrderIds: string[];
  duration: string;
  creatorId: string;
  startDate: Date;
  endDate: Date;
  goal: string;
  status: string;
  dailyStoryPoints: IDailyStoryPoint[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  totalStoryPoint?: number;
}

export interface IDailyStoryPoint {
  date?: Date;
  storyPoints: number;
}
