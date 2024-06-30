export interface IVelocityReport {
  _id: string;
  name: string;
  totalStoryPoint: number;
  completedStoryPoint: number;
}
export interface ISprintReport {
  _id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  creatorId: string;
  status: string;
  totalStoryPoint: number;
  completedStoryPoint: number;
  completedTasks: {
    _id: string;
    cardId: string;
    title: string;
    storyPoint: number;
    assignees: string;
    priorityId: string;
    issueTypeId: string;
  }[];
}
