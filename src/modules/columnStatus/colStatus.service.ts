import { isEmptyObject } from "@core/utils";
import ColumnStatusSchema from "./colStatus.model";
import CreateColumnStatusDto from "./dtos/createColStatusDto";
import { HttpException } from "@core/exceptions";
import { StatusCodes } from "http-status-codes";
export default class ColumnStatusService {
  private colSchema = ColumnStatusSchema;
  public async createColumnStatus(
    model: CreateColumnStatusDto,
    boardId: string,
    session: any
  ) {
    if (isEmptyObject(model)) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Model is empty");
    }
    const existColStatus = await this.colSchema.findOne({
      name: model.name,
      boardId,
    });
    if (existColStatus) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Column status name already exists"
      );
    }
    await this.colSchema.create([{ ...model, boardId }], { session });
  }
}
