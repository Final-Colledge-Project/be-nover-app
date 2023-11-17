import { HttpException } from '@core/exceptions';
import { MAX_SIZE_IMAGE } from '@core/utils';
import { Request } from 'express';
import multer from 'multer';

const multerStorage = multer.memoryStorage();
const multerFilter = (req: Request, file: Request['file'], cb: Function) => {
  if (file?.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new HttpException(400, 'Not an image! Please upload only images.'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: MAX_SIZE_IMAGE,
  },
  fileFilter: multerFilter
});
export const uploadSingleImage = (nameImage: string) => upload.single(nameImage);
