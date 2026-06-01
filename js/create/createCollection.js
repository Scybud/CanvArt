import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";
import { sessionState } from "../session.js";
import { closeModal } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { setButtonLoading } from "../utils/button.js";

const EDGE_FUNCTION_URL =
  "https://tgnrkdnovyhwwooehnxa.supabase.co/functions/v1/upload-artwork";

async function callUploadFunction(formData) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(json?.message ?? `Upload failed (${res.status})`);
  return json;
}

// -------------------------
// CREATE COLLECTION
// -------------------------
export async function createCollection(
  thumbnailInputId,
  previewId,
  nameId,
  descriptionId,
  btnId,
) {
  const thumbnailInput = document.getElementById(thumbnailInputId);
  const previewImg = document.getElementById(previewId);
  const collectionName = document.getElementById(nameId);
  const collectionDescription = document.getElementById(descriptionId);
  const uploadBtn = document.getElementById(btnId);

  thumbnailInput.addEventListener("change", () => {
    const file = thumbnailInput.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    previewImg.src = previewUrl;
    previewImg.addEventListener("load", () => URL.revokeObjectURL(previewUrl), {
      once: true,
    });
  });

  uploadBtn.addEventListener("click", async () => {
    const user = sessionState.user;
    const file = thumbnailInput.files?.[0];
    const nameValue = collectionName.value.trim();
    const descriptionValue = collectionDescription.value.trim();

    if (!user) {
      toastMsg("You must be logged in", "error");
      return;
    }
    if (!nameValue) {
      toastMsg("Please name your collection", "error");
      return;
    }
    if (!file) {
      toastMsg("Please select a thumbnail image", "error");
      return;
    }

    setButtonLoading(uploadBtn, true);
    try {
      const formData = new FormData();
      formData.append("upload_type", "collection_thumbnail");
      formData.append("file", file);
      formData.append("name", nameValue);
      formData.append("description", descriptionValue);

      await callUploadFunction(formData);
      toastMsg("Collection created successfully!", "success");
      closeModal();
    } catch (err) {
      console.error(err);
      toastMsg(err.message ?? "Something went wrong", "error");
    } finally {
      setButtonLoading(uploadBtn, false);
    }
  });
}
