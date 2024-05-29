import ICard from "@modules/cards/card.interface";

export default interface IColumn {
  _id: string;
  title: string;
  description: string;
  boardId: string;
  cardOrderIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isResolved: boolean;
  color: string;
  isActive: boolean;
  WIP: number;
}

export interface IResColumn extends IColumn {
  cards: ICard[];
}
