import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/services";

type UploadProgress = {
  transferredBytes: number;
  totalBytes: number;
  percent: number;
};

type UploadDebug = (label: string, data?: unknown) => void;

export async function uploadSubmissionImage(
  userId: string,
  file: File,
  prefix: string,
  contentType: string,
  onProgress?: (p: UploadProgress) => void,
  timeoutMs: number = 0,
  onDebug?: UploadDebug
): Promise<string> {
  onDebug?.("[UPLOAD] storage init start");
  const storage = getFirebaseStorage();
  onDebug?.("[UPLOAD] storage initialized", {
    bucket: (storage as unknown as { app?: { options?: { storageBucket?: string } } })?.app?.options?.storageBucket,
  });
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const path = `${prefix}/${userId}/${Date.now()}_${safeName}`;
  onDebug?.("[UPLOAD] storage path built", { path });
  const storageRef = ref(storage, path);
  onDebug?.("[UPLOAD] storageRef created", { fullPath: storageRef.fullPath, name: storageRef.name });

  const task = uploadBytesResumable(storageRef, file, { contentType });
  onDebug?.("[UPLOAD] uploadTask created", { state: task.snapshot.state, totalBytes: task.snapshot.totalBytes });

  const result = await new Promise<string>((resolve, reject) => {
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            try {
              task.cancel();
            } catch {
              // ignore
            }
            reject(new Error("Envoi trop long. Vérifie ta connexion et réessaie."));
          }, timeoutMs)
        : null;

    task.on(
      "state_changed",
      (snap) => {
        onDebug?.("[UPLOAD] progress event", {
          state: snap.state,
          bytesTransferred: snap.bytesTransferred,
          totalBytes: snap.totalBytes,
        });
        if (!onProgress) return;
        const total = snap.totalBytes || file.size || 0;
        const transferred = snap.bytesTransferred || 0;
        const percent = total > 0 ? Math.round((transferred / total) * 100) : 0;
        onProgress({ transferredBytes: transferred, totalBytes: total, percent });
      },
      (err) => {
        if (timer) clearTimeout(timer);
        onDebug?.("[UPLOAD] upload error", err);
        reject(err);
      },
      async () => {
        if (timer) clearTimeout(timer);
        onDebug?.("[UPLOAD] upload complete");
        try {
          onDebug?.("[UPLOAD] getDownloadURL start");
          const url = await getDownloadURL(task.snapshot.ref);
          onDebug?.("[UPLOAD] download URL ok", { url });
          resolve(url);
        } catch (err) {
          onDebug?.("[UPLOAD] getDownloadURL error", err);
          reject(err);
        }
      }
    );
  });

  return result;
}
