import ICard from "@modules/cards/card.interface";

export default interface IColumn {
  _id: string;
  title: string;
  boardId: string;
  cardOrderIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface IResColumn extends IColumn {
  cards: ICard[]
}