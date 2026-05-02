import { isSupabaseConfigured, supabase } from "../config/supabase";

const resolveBucketAndFolder = (bucketOrFolder = "vehicles", folder = "") => {
  if (bucketOrFolder.includes("/") && !folder) {
    return { bucket: "vehicles", folder: bucketOrFolder };
  }
  return { bucket: bucketOrFolder || "vehicles", folder };
};

export async function uploadImage(file, bucket = "vehicles", folder = "") {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to upload images.");
  }

  const resolved = resolveBucketAndFolder(bucket, folder);
  const ext = String(file.name || "file").split(".").pop();
  const safeFolder = resolved.folder ? `${resolved.folder.replace(/^\/+|\/+$/g, "")}/` : "";
  const fileName = `${safeFolder}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(resolved.bucket).upload(fileName, file, { upsert: false });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(resolved.bucket).getPublicUrl(fileName);
  return publicUrl;
}

export async function uploadMultipleImages(files, bucket = "vehicles", folder = "") {
  return Promise.all(Array.from(files).map((file) => uploadImage(file, bucket, folder)));
}

export async function uploadDocument(file, folder = "docs") {
  return uploadImage(file, "documents", folder);
}

export async function deleteFile(url, bucket = "vehicles") {
  if (!isSupabaseConfigured || !url) {
    return;
  }

  const path = url.split(`/${bucket}/`)[1];
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error("Delete error:", error);
}
