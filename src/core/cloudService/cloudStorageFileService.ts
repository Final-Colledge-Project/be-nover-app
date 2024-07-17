import { Storage, Bucket, File } from "@google-cloud/storage";
import * as path from "path";
import { createWriteStream } from "fs";
import { Response } from "express";
export default class CloudStorageFileService {
  private storage: Storage;
  constructor() {
    this.storage = new Storage({
      projectId: process.env.PROJECT_GCP_ID,
      keyFilename: process.env.KEY_FILE_NAME,
    });
  }

  async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    const bucket: Bucket = this.storage.bucket(bucketName);
    const file: File = bucket.file(fileName);
    const [exists] = await file.exists();
    return exists;
  }

  async isFolderEmpty(
    bucketName: string,
    folderName: string
  ): Promise<boolean> {
    const bucket: Bucket = this.storage.bucket(bucketName);
    const [files] = await bucket.getFiles({
      prefix: folderName,
    });
    return files.length === 0;
  }

  async uploadFile(
    file: Express.Multer.File,
    bucketName: string,
    fileName?: string
  ): Promise<void> {
    try {
      const bucket = this.storage.bucket(bucketName);
      const blob = bucket.file(fileName || file.originalname);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      return new Promise((resolve, reject) => {
        blobStream
          .on("finish", () => {
            console.log(`${file.originalname} uploaded to ${bucketName}.`);
            resolve();
          })
          .on("error", (err) => {
            reject(err);
          })
          .end(file.buffer);
      });
    } catch (err) {
      throw new Error("Failed to upload file to cloud storage");
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    bucketName: string,
    issueType: string,
    itemId: string
  ): Promise<void> {
    try {
      for (const file of files) {
        // Optionally customize this
        const fileName = `${issueType}/${itemId}/${file.originalname}`;
        await this.uploadFile(file, bucketName, fileName);
      }
    } catch (err) {
      console.log("🤘================>err", err);
      throw new Error("Failed to upload files to cloud storage");
    }
  }

  getContentType = (fileName: string): string => {
    const ext = path.extname(fileName).toLowerCase();
    console.log("🚀 ~ CloudStorageFileService ~ ext:", ext);
    switch (ext) {
      case ".pdf":
        return "application/pdf";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".png":
        return "image/png";
      case ".txt":
        return "text/plain";
      case ".html":
        return "text/html";
      default:
        return "application/octet-stream";
    }
  };

  async downloadFile(
    bucketName: string,
    formatFileName: string,
    fileName: string,
    res: Response
  ): Promise<any> {
    try {
      const file = this.storage.bucket(bucketName).file(formatFileName);

      // Check if the file exists
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).send("File not found.");
      }

      // Set appropriate headers for the response
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${formatFileName}`
      );
      res.setHeader("Content-Type", this.getContentType(formatFileName));

      // Stream the file contents to the response
      file
        .createReadStream()
        .on("error", (error) => {
          console.error("Error reading file:", error);
          res.status(500).send("Failed to read file.");
        })
        .pipe(res);
    } catch (err) {
      console.error("Error:", err);
      throw new Error("Failed to download file from cloud storage");
    }
  }
  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    try {
      const isExist = await this.fileExists(bucketName, fileName);
      if (!isExist) {
        throw new Error("File not found");
      }
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(fileName);

      await file.delete({ ignoreNotFound: true });
      const folderName = fileName.split("/")[1];
      const isEmpty = await this.isFolderEmpty(bucketName, folderName);
      if (isEmpty) {
        await this.storage
          .bucket(bucketName)
          .deleteFiles({ prefix: folderName });
      }
    } catch (err) {
      throw new Error("Failed to delete file from cloud storage");
    }
  }

  async generateSignedUrl(
    fileName: string,
    bucketName: string,
    itemId: string,
    issueType: string
  ): Promise<string> {
    let url = "";

    const fileNameFormat = `${issueType}/${itemId}/${fileName}`;

    const file = this.storage.bucket(bucketName).file(fileNameFormat);

    // Check if the file exists
    const [exists] = await file.exists();
    if (exists) {
      const options = {
        action: "read" as const,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      const bucketFile = this.storage.bucket(bucketName).file(fileNameFormat);
      const [signedUrl] = await bucketFile.getSignedUrl(options);
      url = signedUrl;
    }
    return url;
  }
}
