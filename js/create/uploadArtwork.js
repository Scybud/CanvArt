import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";
import { compressImage } from "../utils/compressImg.js";
import { sessionState } from "../session.js";
import { closeModal } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";

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

  let compressedFile = null;

  // ⭐ INSTANT PREVIEW WHEN USER SELECTS IMAGE
  artworkInput.addEventListener("change", async () => {
    const file = artworkInput.files?.[0];
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
          artworkInput.value = "";
          return;
        }

        compressedFile = new File([compressedBlob], "artwork.webp", {
          type: "image/webp",
        });

        const previewUrl = URL.createObjectURL(compressedBlob);
        previewImg.src = previewUrl;

        previewImg.onload = () => URL.revokeObjectURL(previewUrl);
      };
    } catch (err) {
      console.error(err);
      toastMsg("Could not preview artwork", "error");
    }
  });

  // ⭐ UPLOAD BUTTON HANDLER
  uploadBtn.addEventListener("click", async () => {
    const artworkTitle = artworkTitleInput.value.trim();
    const artworkDesc = artworkDescInput.value.trim();
    const user = sessionState.user;

    if (!user) {
      toastMsg("You must be logged in to upload artwork", "error");
      return;
    }

    if (!compressedFile) {
      toastMsg("Please select an artwork image", "error");
      return;
    }

    /*
    if (!artworkDesc) {
      toastMsg("Tell us why you want to share this art", "error");
      return;
    }
*/

    try {
      const artworkId = crypto.randomUUID();
      const filePath = `${user.id}/${artworkId}.webp`;

      // Upload to bucket
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(filePath, compressedFile);

      if (uploadError) {
        console.error(uploadError);
        toastMsg("Could not upload artwork", "error");
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("artworks")
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Insert into artworks table
      const { error: dbError } = await supabase.from("artworks").insert({
        id: artworkId,
        user_id: user.id,
        title: artworkTitle,
        description: artworkDesc,
        artwork_url: imageUrl,
      });

      if (dbError) {
        console.error(dbError);
        toastMsg("Could not save artwork info", "error");
        return;
      }

      toastMsg("Artwork uploaded successfully!", "success");
    } catch (err) {
      console.error(err);
      toastMsg("Something went wrong", "error");
    }

    closeModal();
  });
}
