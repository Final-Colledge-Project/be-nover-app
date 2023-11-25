import { catchAsync } from "@core/utils";
import { Request, Response } from "express";
import SubCardService from "./subCard.service";
import AddSubTaskDto from "./dtos/addSubTaskDto";
import { StatusCodes } from "http-status-codes";
export default class SubCardController {
  private subCardService = new SubCardService();
  public createSubCard = catchAsync(async (req: Request, res: Response) => {
    const model : AddSubTaskDto = req.body;
    const userId = req.user.id;
    const subCard = await this.subCardService.createSubCard(model, userId);
    res.status(StatusCodes.CREATED).json({data: subCard, message: "Create sub card successfully" });
  })
}