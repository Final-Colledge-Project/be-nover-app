import { Request } from 'express';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

export const getImageUrl = async (req: Request) => {
  const storage = getStorage();
  if (!req.file) {
    throw new Error('File is not exists');
  }
  const storageRef = ref(storage, `files/${req.file.originalname}`)
  // Create file metadata including the content type
  const metadata = {
    contentType: req.file.mimetype,
  };
  // Upload the file in the bucket storage
  const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata)
  // by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
  // Grab the public url
  return await getDownloadURL(snapshot.ref)
};
