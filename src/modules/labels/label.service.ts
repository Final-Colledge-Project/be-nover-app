import LabelSchema from "./label.model";
import ILabel from "./label.interface";
import { HttpException } from "@core/exceptions";
import {
  isBoardAdmin,
  isBoardMember,
  isEmptyObject,
  viewedBoardPermission,
} from "@core/utils";
import CreateLabelDto from "./dtos/createLabelDto";
import { BoardSchema } from "@modules/boards";
import UpdateLabelDto from "./dtos/updateLabelDto";
import { CardSchema } from "@modules/cards";
import { EpicSchema } from "@modules/epics";
import { SubCardSchema } from "@modules/subCards";
import { StatusCodes } from "http-status-codes";
import { assign } from "lodash";
export default class LabelService {
  private labelSchema = LabelSchema;
  private cardSchema = CardSchema;
  private epicSchema = EpicSchema;
  private subCardSchema = SubCardSchema;
  public async createLabel(
    model: CreateLabelDto,
    boardId: string
  ): Promise<ILabel> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const existBoard = await BoardSchema.findById(boardId).exec();
    if (!existBoard) {
      throw new HttpException(404, "Board not found");
    }
    const newLabel = await this.labelSchema.create({ ...model, boardId });
    if (!newLabel) {
      throw new HttpException(409, "Label not created");
    }
    return newLabel;
  }
  public async getLabelsByBoardId(
    boardId: string,
    userId: string
  ): Promise<ILabel[]> {
    const existBoard = await BoardSchema.findById(boardId).exec();
    if (!existBoard) {
      throw new HttpException(404, "Board not found");
    }
    const isMem = await isBoardMember(boardId, userId);
    if (!isMem) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Permission denied");
    }
    const distinctIdsInCard = await this.cardSchema.distinct("labelId");
    const distinctIdsInEpic = await this.epicSchema.distinct("labelId");
    const distinctIdsInSubCard = await this.subCardSchema.distinct("labelId");
    const distinctIds = [
      ...new Set([
        ...distinctIdsInCard,
        ...distinctIdsInEpic,
        ...distinctIdsInSubCard,
      ]),
    ];
    const labelInUse = await this.labelSchema
      .find({
        _id: { $in: distinctIds },
      })
      .exec();
    const labels = await this.labelSchema.find({ boardId: boardId }).exec();
    return labels.map((label: ILabel) => {
      const isUse = labelInUse.some((item) => item._id.equals(label._id));
      return assign({}, label.toObject(), { canDelete: !isUse });
    });
  }
  public async getLabelById(labelId: string): Promise<ILabel> {
    const label = await this.labelSchema.findById(labelId).exec();
    if (!label) {
      throw new HttpException(404, "Label not found");
    }
    return label;
  }
  public async updateLabel(
    labelId: string,
    model: UpdateLabelDto
  ): Promise<ILabel> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const existLabel = await this.labelSchema.findById(labelId).exec();
    if (!existLabel) {
      throw new HttpException(404, "Label not found");
    }
    const label = await this.labelSchema
      .findByIdAndUpdate(labelId, model, { new: true })
      .exec();
    if (!label) {
      throw new HttpException(409, "Label not updated");
    }
    return label;
  }
  public async deleteLabel(labelId: string, userId: string): Promise<void> {
    const existLabel = await this.labelSchema
      .findById(labelId)
      .select("+isActive")
      .exec();
    if (!existLabel) {
      throw new HttpException(404, "Label not found");
    }
    const distinctIdsInCard = await this.cardSchema.distinct("labelId");
    const distinctIdsInEpic = await this.epicSchema.distinct("labelId");
    const distinctIdsInSubCard = await this.subCardSchema.distinct("labelId");
    const distinctIds = [
      ...new Set([
        ...distinctIdsInCard,
        ...distinctIdsInEpic,
        ...distinctIdsInSubCard,
      ]),
    ];
    const labelsInUse = await this.labelSchema
      .find({
        _id: { $in: distinctIds },
      })
      .exec();
    const isUsed = labelsInUse.some(
      (item) => item._id.toString() === labelId.toString()
    );
    if (isUsed) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Label is in use");
    }
    await this.labelSchema.findByIdAndDelete(labelId).exec();
  }
}
