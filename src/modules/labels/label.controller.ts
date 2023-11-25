import { Request, Response } from "express";
import LabelService from "./label.service";
import { catchAsync } from "@core/utils";
import CreateLabelDto from "./dtos/createLabelDto";
import UpdateLabelDto from "./dtos/updateLabelDto";
export default class LabelController {
  private labelService = new LabelService();
  public createLabel = catchAsync(
    async (req: Request, res: Response) => {
      const model: CreateLabelDto = req.body;
      const userId = req.user.id;
      const label = await this.labelService.createLabel(model, userId);
      res
        .status(201)
        .json({ data: label, message: "Create label successfully" });
    }
  );
  public getLabelsByBoardId = catchAsync(
    async (req: Request, res: Response) => {
      const boardId = req.params.id;
      const labels = await this.labelService.getLabelsByBoardId(boardId);
      res
        .status(200)
        .json({ data: labels, message: "Get labels successfully" });
    }
  );
  public getLabelById = catchAsync(
    async (req: Request, res: Response) => {
      const labelId = req.params.id;
      const label = await this.labelService.getLabelById(labelId);
      res.status(200).json({ data: label, message: "Get label successfully" });
    }
  );
  public updateLabel = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const labelId = req.params.id;
    const model: UpdateLabelDto = req.body;
    const label = await this.labelService.updateLabel(labelId, model, userId);
    res.status(200).json({ data: label, message: "Update label successfully" });
  })
  public deleteLabel = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const labelId = req.params.id;
    await this.labelService.deleteLabel(labelId, userId);
    res.status(204).json({ message: "Delete label successfully" });
  })
}

