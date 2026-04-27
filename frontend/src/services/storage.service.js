import { uploadToCloudinary } from "../config/cloudinary";

export async function uploadImage(file, folder = "vehicles") {
  if (!file) {
    throw new Error("No file provided");
  }

  return uploadToCloudinary(file, `heavyhub/${folder}`);
}

export async function uploadMultipleImages(files, folder = "vehicles") {
  const uploads = Array.from(files).map((file) => uploadImage(file, folder));
  return Promise.all(uploads);
}

export async function uploadDocument(file, folder = "documents") {
  if (!file) {
    throw new Error("No file provided");
  }

  return uploadToCloudinary(file, `heavyhub/${folder}`);
}

export async function deleteFile(url) {
  console.warn("File deletion not implemented on frontend. URL:", url);
}
