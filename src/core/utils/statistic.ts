import ICard from "@modules/cards/card.interface";
import dayjs, { Dayjs } from "dayjs";
import { AVERAGE_AGE_PERIOD } from "./constant";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";

//Get average age of tasks
export const calculateTaskAge = (createdDate: Date): number => {
  const creation = dayjs(createdDate);
  const today = dayjs();
  return today.diff(creation, "day");
};

const filterTaskByPeriod = (
  tasks: ICard[],
  period: string,
  previousDay: number
) => {
  const today = dayjs();

  let startDate: Dayjs;
  switch (period) {
    case AVERAGE_AGE_PERIOD.daily:
      startDate = today.startOf("day");
      break;
    case AVERAGE_AGE_PERIOD.weekly:
      startDate = today.subtract(1, "week").startOf("day");
      break;
    case AVERAGE_AGE_PERIOD.monthly:
      startDate = today.subtract(1, "month").startOf("day");
      break;
    case AVERAGE_AGE_PERIOD.quarterly:
      startDate = today.subtract(3, "month").startOf("day");
      break;
    case AVERAGE_AGE_PERIOD.yearly:
      startDate = today.subtract(1, "year").startOf("day");
      break;
    default:
      throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid period");
  }

  const overPreviousDay = dayjs().subtract(previousDay, "day");
  return tasks.filter((task) => {
    const creation = dayjs(task.createdAt);
    return (
      creation.isBefore(startDate) &&
      task.resolvedAt === null &&
      creation.isAfter(overPreviousDay)
    );
  });
};

export const calculateAverageAge = (task: ICard[]) => {
  if (!task.length) return 0;
  const totalAge: number = task.reduce((sum, task) => {
    return sum + calculateTaskAge(task.createdAt);
  }, 0);
  return totalAge / task.length;
};

export const calculateAverageAgeReport = (
  tasks: ICard[],
  period: string,
  previousDay: number
) => {
  const filterTasks = filterTaskByPeriod(tasks, period, previousDay);
  const averageAge = calculateAverageAge(filterTasks);
  const averageEachTask = filterTasks.map((task) => {
    return {
      _id: task._id,
      taskId: task.cardId,
      name: task.title,
      createDate: task.createdAt,
      age: calculateTaskAge(task.createdAt),
      status: task.columnId,
    };
  });
  return { averageAge, averageEachTask };
};
