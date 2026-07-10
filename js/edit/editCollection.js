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
// EDIT COLLECTION
// -------------------------
export async function updateCollection(
  collectionId,
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
  const updateBtn = document.getElementById(btnId);

  const user = sessionState.user;
  if (!user) {
    toastMsg("User not logged in", "error");
    return;
  }
  if (!collectionId) {
    toastMsg("No collection selected to edit", "error");
    return;
  }

  // -----------------------------------
  // LOAD EXISTING COLLECTION DATA
  // -----------------------------------
  try {
    const { data: collectionData, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error(error);
      toastMsg("Could not load collection data", "error");
      return;
    }

    collectionName.value = collectionData?.name || "";
    collectionDescription.value = collectionData?.description || "";

    if (collectionData?.thumbnail_url) {
      previewImg.src = collectionData.thumbnail_url;
    }
  } catch (err) {
    console.error(err);
    toastMsg("Something went wrong loading collection", "error");
    return;
  }

  // -----------------------------------
  // IMAGE PREVIEW (no compression — matches create flow,
  // Cloudinary handles optimization server-side)
  // -----------------------------------
  thumbnailInput.addEventListener("change", () => {
    const file = thumbnailInput.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    previewImg.src = previewUrl;
    previewImg.addEventListener("load", () => URL.revokeObjectURL(previewUrl), {
      once: true,
    });
  });

  // -----------------------------------
  // SUBMIT EDIT
  // -----------------------------------
  updateBtn.addEventListener("click", async () => {
    const nameValue = collectionName.value.trim();
    const descriptionValue = collectionDescription.value.trim();
    const file = thumbnailInput.files?.[0];

    if (!nameValue) {
      toastMsg("Please type a name", "error");
      return;
    }

    setButtonLoading(updateBtn, true);
    try {
      if (file) {
        // Thumbnail changed — goes through edge function
        // (Cloudinary upload + DB update + old-asset cleanup)
        const formData = new FormData();
        formData.append("upload_type", "collection_thumbnail");
        formData.append("collection_id", collectionId);
        formData.append("name", nameValue);
        formData.append("description", descriptionValue);
        formData.append("file", file);

        await callUploadFunction(formData);
      } else {
        // Metadata only — direct DB update, no Cloudinary involved
        const { error: dbError } = await supabase
          .from("collections")
          .update({
            name: nameValue,
            description: descriptionValue,
          })
          .eq("id", collectionId)
          .eq("user_id", user.id);

        if (dbError) {
          console.error(dbError);
          toastMsg("Could not save collection", "error");
          return;
        }
      }

      toastMsg("Collection updated successfully!", "success");
      closeModal();
    } catch (err) {
      console.error(err);
      toastMsg(err.message ?? "Something went wrong", "error");
    } finally {
      setButtonLoading(updateBtn, false);
    }
  });
}
