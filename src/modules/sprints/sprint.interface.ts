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
  actualCompletedDate: Date;
}

export interface IDailyStoryPoint {
  date?: Date;
  storyPoints: number;
}

export interface IBacklogDetail {
  _id: string;
  boardId: string;
  name: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  status: string;
  cards: [
    {
      _id: string;
      title: string;
      storyPoints: number;
      column: {
        _id: string;
        title: string;
        isResolved: boolean;
      };
      issueType: {
        _id: string;
        name: string;
      };
      assignee: {
        _id: string;
        avatar: string;
        fullName: string;
      };
    }
  ];
}
