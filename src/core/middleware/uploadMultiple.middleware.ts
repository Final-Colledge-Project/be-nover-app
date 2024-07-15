import { MAX_FILES } from "@core/utils";
import express, { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import path from "path";

// Define allowed file types and maximum file size (in bytes)
const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/xml",
  "text/xml",
  "application/atom+xml",
  "application/zip",
  "application/rtf",
  "application/vnd.rar",
  "text/rtf",
  "text/xml",
  "application/x-rar-compressed",
  "application/octet-stream",
];
const maxFileSize = 2 * 1024 * 1024; // 2 MB

const storage = multer.memoryStorage();

//Multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, and PDF files are allowed."
        )
      );
    }
  },
});

export const uploadMultipleMiddleware = upload.array("files", MAX_FILES);

export const fileUploadErrorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "File size exceeds the allowed limit of 2MB." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Exceeded maximum number of files allowed." });
    }
  } else if (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
  }
  next();
};
