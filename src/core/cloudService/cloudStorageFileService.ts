import { Storage, Bucket, File } from "@google-cloud/storage";
import * as path from "path";
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

  async downloadFile(bucketName: string, fileName: string): Promise<void> {
    try {
      const isExist = await this.fileExists(bucketName, fileName);
      if (!isExist) {
        throw new Error("File not found");
      }
      const bucket = this.storage.bucket(bucketName);
      const blob = bucket.file(fileName);
      const blobStream = blob.createReadStream();
      return new Promise((resolve, reject) => {
        blobStream
          .on("finish", () => {
            console.log(`${fileName} downloaded from ${bucketName}.`);
            resolve();
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    } catch (err) {
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
}
