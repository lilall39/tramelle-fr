import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/services";

export async function uploadSubmissionImage(userId: string, file: File, prefix: string): Promise<string> {
  const storage = getFirebaseStorage();
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const path = `${prefix}/${userId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type || undefined });
  return getDownloadURL(storageRef);
}
