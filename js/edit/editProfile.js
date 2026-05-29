import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";
import { compressImage } from "../utils/compressImg.js";
import { sessionState } from "../session.js";
import { closeModal } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";

export async function updateProfile(
  avatarInputId,
  previewId,
  nameId,
  usernameId,
  emailId,
  bioId,
  btnId,
) {
  // -----------------------------------
  // ELEMENTS
  // -----------------------------------

  const avatarInput = document.getElementById(avatarInputId);
  const previewImg = document.getElementById(previewId);

  const profileName = document.getElementById(nameId);
  const profileUsername = document.getElementById(usernameId);
  const profileEmail = document.getElementById(emailId);
  const profileBio = document.getElementById(bioId);

  const updateBtn = document.getElementById(btnId);

  // -----------------------------------
  // USER
  // -----------------------------------

  const user = sessionState.user;

  if (!user) {
    toastMsg("User not logged in", "error");
    return;
  }

  // -----------------------------------
  // STATE
  // -----------------------------------

  let compressedFile = null;

  // -----------------------------------
  // LOAD EXISTING PROFILE DATA
  // -----------------------------------

  try {
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
      toastMsg("Could not load profile", "error");
      return;
    }

    // Populate fields
    profileName.value = profileData?.name || "";
    profileUsername.value = profileData?.username || "";
    profileEmail.value = profileData?.email || user.email || "";
    profileBio.value = profileData?.bio || "";

    // Avatar preview
    if (profileData?.avatar_url) {
      previewImg.src = profileData.avatar_url;
    }
  } catch (err) {
    console.error(err);
    toastMsg("Something went wrong loading profile", "error");
  }

  // -----------------------------------
  // IMAGE PREVIEW
  // -----------------------------------

  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files?.[0];

    if (!file) return;

    try {
      const tempUrl = URL.createObjectURL(file);

      const img = new Image();
      img.src = tempUrl;

      img.onload = async () => {
        URL.revokeObjectURL(tempUrl);

        const compressedBlob = await compressImage(img);

        if (!compressedBlob) {
          toastMsg("Could not compress avatar below required size", "error");

          avatarInput.value = "";

          return;
        }

        compressedFile = new File([compressedBlob], "avatar.webp", {
          type: "image/webp",
        });

        const previewUrl = URL.createObjectURL(compressedBlob);

        previewImg.src = previewUrl;

        previewImg.addEventListener(
          "load",
          () => URL.revokeObjectURL(previewUrl),
          {
            once: true,
          },
        );
      };
    } catch (err) {
      console.error(err);
      toastMsg("Could not preview avatar", "error");
    }
  });

  // -----------------------------------
  // UPDATE PROFILE
  // -----------------------------------

  updateBtn.addEventListener("click", async () => {
    const profileNameValue = profileName.value.trim();
    const profileBioValue = profileBio.value.trim();

    if (!profileNameValue) {
      toastMsg("Please type a name", "error");
      return;
    }

    try {
      let imageUrl = previewImg.src;

      // -----------------------------------
      // UPLOAD NEW AVATAR IF EXISTS
      // -----------------------------------

      if (compressedFile) {
        const filePath = `${user.id}.webp`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, compressedFile, {
            upsert: true,
          });

        if (uploadError) {
          console.error(uploadError);
          toastMsg("Could not upload avatar", "error");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // -----------------------------------
      // UPDATE DATABASE
      // -----------------------------------

      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          name: profileNameValue,
          bio: profileBioValue,
          avatar_url: imageUrl,
        })
        .eq("id", user.id);

      if (dbError) {
        console.error(dbError);
        toastMsg("Could not save profile info", "error");
        return;
      }

      toastMsg("Profile updated successfully!", "success");

      closeModal();
    } catch (err) {
      console.error(err);
      toastMsg("Something went wrong", "error");
    }
  });
}
