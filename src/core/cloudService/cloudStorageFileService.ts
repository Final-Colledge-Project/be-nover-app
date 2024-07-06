import { Storage, Bucket, File } from "@google-cloud/storage";
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
}
