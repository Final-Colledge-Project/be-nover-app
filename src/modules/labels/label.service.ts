import LabelSchema from "./label.model";
import ILabel from "./label.interface";
import { HttpException } from "@core/exceptions";
import { isBoardAdmin, isBoardLead, isEmptyObject, viewedBoardPermission } from "@core/utils";
import CreateLabelDto from "./dtos/createLabelDto";
import { BoardSchema } from "@modules/boards";
import UpdateLabelDto from "./dtos/updateLabelDto";
export default class LabelService {
  private labelSchema = LabelSchema;
  public async createLabel(
    model: CreateLabelDto,
    userId: string
  ): Promise<ILabel> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const existBoard = await BoardSchema.findById(model.boardId).exec();
    if (!existBoard) {
      throw new HttpException(404, "Board not found");
    }
    const boardLead = await isBoardLead(model.boardId, userId);
    const boardAdmin = await isBoardAdmin(model.boardId, userId);
    if (boardLead === false && boardAdmin === false) {
      throw new HttpException(403, "You are not admin of this board");
    }

    const newLabel = await this.labelSchema.create({ ...model });
    if (!newLabel) {
      throw new HttpException(409, "Label not created");
    }
    return newLabel;
  }
  public async getLabelsByBoardId(boardId: string, userId: string ): Promise<ILabel[]> {
    const existBoard = await BoardSchema.findById(boardId).exec();
    if (!existBoard) {
      throw new HttpException(404, "Board not found");
    }
    if(await viewedBoardPermission(boardId, userId) === false){
      throw new HttpException(403, "Board is private");
    }
    const labels = await this.labelSchema.find({ boardId: boardId }).exec();
    return labels;
  }
  public async getLabelById(labelId: string): Promise<ILabel> {
    const label = await this.labelSchema.findById(labelId).exec();
    if (!label) {
      throw new HttpException(404, "Label not found");
    }
    return label;
  }
  public async updateLabel(labelId: string, model: UpdateLabelDto, userId: string): Promise<ILabel> {
    if(isEmptyObject(model)){
      throw new HttpException(400, "Model is empty");
    }
    const existLabel = await this.labelSchema.findById(labelId).exec();
    if(!existLabel){
      throw new HttpException(404, "Label not found");
    }
    const boardLead = await isBoardLead(existLabel.boardId, userId);
    const boardAdmin = await isBoardAdmin(existLabel.boardId, userId);
    if (boardLead === false && boardAdmin === false) {
      throw new HttpException(403, "You are not admin of this board");
    }
    const label = await this.labelSchema.findByIdAndUpdate(labelId, model, {new: true}).exec();
    if(!label){
      throw new HttpException(409, "Label not updated");
    }
    return label;
  }
  public async deleteLabel(labelId: string, userId: string): Promise<void> {
    const existLabel = await this.labelSchema.findById(labelId).select('+isActive').exec();
    if(!existLabel){
      throw new HttpException(404, "Label not found");
    }
    const boardLead = await isBoardLead(existLabel.boardId, userId);
    const boardAdmin = await isBoardAdmin(existLabel.boardId, userId);
    if (boardLead === false && boardAdmin === false) {
      throw new HttpException(403, "You are not admin of this board");
    }
    await this.labelSchema.findByIdAndUpdate(labelId, {isActive: false}, {new: true}).exec();
  }
}
