import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";
import { sessionState } from "../session.js";
import { closeModal } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";

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
// UPLOAD ARTWORK (standalone)
// -------------------------
export async function uploadArtwork(
  artworkInputId,
  previewId,
  titleId,
  descriptionId,
  btnId,
) {
  const artworkInput = document.getElementById(artworkInputId);
  const previewImg = document.getElementById(previewId);
  const artworkTitleInput = document.getElementById(titleId);
  const artworkDescInput = document.getElementById(descriptionId);
  const uploadBtn = document.getElementById(btnId);

  artworkInput.addEventListener("change", () => {
    const file = artworkInput.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    previewImg.src = previewUrl;
    previewImg.addEventListener("load", () => URL.revokeObjectURL(previewUrl), {
      once: true,
    });
  });

  uploadBtn.addEventListener("click", async () => {
    const user = sessionState.user;
    const file = artworkInput.files?.[0];

    if (!user) {
      toastMsg("You must be logged in to upload artwork", "error");
      return;
    }
    if (!file) {
      toastMsg("Please select an artwork image", "error");
      return;
    }

    uploadBtn.disabled = true;
    try {
      const formData = new FormData();
      formData.append("upload_type", "artwork");
      formData.append("file", file);
      formData.append("title", artworkTitleInput.value.trim());
      formData.append("description", artworkDescInput.value.trim());

      await callUploadFunction(formData);
      toastMsg("Artwork uploaded successfully!", "success");
      closeModal();
    } catch (err) {
      console.error(err);
      toastMsg(err.message ?? "Something went wrong", "error");
    } finally {
      uploadBtn.disabled = false;
    }
  });
}

// -------------------------
// ADD ARTWORK TO COLLECTION
// -------------------------
export async function addArtworkToCollection(
  artworkInputId,
  previewId,
  titleId,
  descriptionId,
  collectionId,
  btnId,
) {
  const artworkInput = document.getElementById(artworkInputId);
  const previewImg = document.getElementById(previewId);
  const artworkTitleInput = document.getElementById(titleId);
  const artworkDescInput = document.getElementById(descriptionId);
  const uploadBtn = document.getElementById(btnId);

  artworkInput.addEventListener("change", () => {
    const file = artworkInput.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    previewImg.src = previewUrl;
    previewImg.addEventListener("load", () => URL.revokeObjectURL(previewUrl), {
      once: true,
    });
  });

  uploadBtn.addEventListener("click", async () => {
    const user = sessionState.user;
    const file = artworkInput.files?.[0];

    if (!user) {
      toastMsg("You must be logged in to upload artwork", "error");
      return;
    }
    if (!file) {
      toastMsg("Please select an artwork image", "error");
      return;
    }
    if (!collectionId) {
      toastMsg("No collection selected", "error");
      return;
    }

    uploadBtn.disabled = true;
    try {
      const formData = new FormData();
      formData.append("upload_type", "collection_artwork");
      formData.append("file", file);
      formData.append("title", artworkTitleInput.value.trim());
      formData.append("description", artworkDescInput.value.trim());
      formData.append("collection_id", collectionId);

      const result = await callUploadFunction(formData);

      toastMsg(
        result.warning ?? "Artwork uploaded successfully!",
        result.warning ? "warning" : "success",
      );
      closeModal();
    } catch (err) {
      console.error(err);
      toastMsg(err.message ?? "Something went wrong", "error");
    } finally {
      uploadBtn.disabled = false;
    }
  });
}
