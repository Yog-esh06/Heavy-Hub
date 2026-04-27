export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo",
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "heavyhub_unsigned",
};

export async function uploadToCloudinary(file, folder = "heavyhub") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  const data = await res.json();
  return data.secure_url;
}

export async function deleteFromCloudinary(publicId) {
  console.warn("Cloudinary deletion requires server-side signing - skipping for now", publicId);
}
