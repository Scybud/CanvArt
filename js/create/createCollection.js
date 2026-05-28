import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";
import { compressImage } from "../utils/compressImg.js";
import { sessionState } from "../session.js";
import { closeModal } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";

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

  let compressedFile = null;

  // ⭐ INSTANT PREVIEW WHEN USER SELECTS IMAGE
  thumbnailInput.addEventListener("change", async () => {
    const file = thumbnailInput.files?.[0];
    if (!file) return;

    try {
      const tempUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = tempUrl;

      img.onload = async () => {
        URL.revokeObjectURL(tempUrl);

        const compressedBlob = await compressImage(img);
        if (!compressedBlob) {
          toastMsg("Could not compress artwork below required size", "error");
          thumbnailInput.value = "";
          return;
        }

        compressedFile = new File([compressedBlob], "thumbnail.webp", {
          type: "image/webp",
        });

        const previewUrl = URL.createObjectURL(compressedBlob);
        previewImg.src = previewUrl;

previewImg.addEventListener("load", () => URL.revokeObjectURL(previewUrl), {
  once: true,
});
      };
    } catch (err) {
      console.error(err);
      toastMsg("Could not preview artwork", "error");
    }
  });

  // ⭐ UPLOAD BUTTON HANDLER
  uploadBtn.addEventListener("click", async () => {
const collectionNameValue = collectionName.value.trim();
const collectionDescriptionValue = collectionDescription.value.trim();
    const user = sessionState.user;

    if (!user) {
      toastMsg("You must be logged in to upload artwork", "error");
      return;
    }
if(!collectionNameValue) {
    toastMsg("Please name your collection", "error");
    return;
}
    if (!compressedFile) {
      toastMsg("Please select an artwork image", "error");
      return;
    }

    /*
    if (!collectionDescription) {
      toastMsg("Tell us why you want to share this art", "error");
      return;
    }
*/

    try {
      const collectionId = crypto.randomUUID();
      const filePath = `${user.id}/${collectionId}.webp`;

      // Upload to bucket
      const { error: uploadError } = await supabase.storage
        .from("collection_thumbnails")
        .upload(filePath, compressedFile);

      if (uploadError) {
        console.error(uploadError);
        toastMsg("Could not upload artwork", "error");
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("collection_thumbnails")
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Insert into artworks table
      const { error: dbError } = await supabase.from("collections").insert({
        id: collectionId,
        user_id: user.id,
        name: collectionName,
        description: collectionDescription,
        thumbnail_url: imageUrl,
      });

      if (dbError) {
        console.error(dbError);
        toastMsg("Could not save collection info", "error");
        return;
      }

      toastMsg("Collection created successfully!", "success");
    } catch (err) {
      console.error(err);
      toastMsg("Something went wrong", "error");
    }

    closeModal();
  });
}
