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
    _id: any;
    title: string;
    storyPoint: number;
    assignees: string;
    priority: string;
    issueTypeId: string;
  }[];
}
