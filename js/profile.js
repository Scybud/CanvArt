import { fetchArtistProfile } from "./data/artists.js";
import { fetchArtworksByUserId } from "./data/artworks.js";
import { toastMsg } from "./components/toast.js";
import { createArtworkCard, magnifyImg } from "./components/artworkCard.js";
import { uploadArtwork } from "./create/uploadArtwork.js";
import { fetchCollectionsByUserId } from "./data/collections.js";
import { createCollectionCard } from "./components/collectionCard.js";
import { createEmptyState } from "./components/emptyState.js";
import { sessionReady, sessionState } from "./session.js";
import { createCollection } from "./create/createCollection.js";
import {
  loadComponent,
  closeModal,
} from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { updateProfile } from "./edit/editProfile.js";

let profile = null;
let isOwner = null;

function getUsername() {
  const url = new URL(window.location.href);

  const queryUser = url.searchParams.get("user");
  if (queryUser) return queryUser;

  const parts = url.pathname.split("/").filter(Boolean);

  if (parts[0] === "profile" && parts[1]) {
    return parts[1];
  }

  return null;
}

function setActive(button) {
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  button.classList.add("active");
}


async function authUser(profile) {
  const editProfile = document.getElementById("profileEdit");

  if (!editProfile) return;

  const isOwner = sessionState.user?.id === profile.id;

  if (!isOwner) {
    editProfile.remove();
  }
}


async function showArtworks(content) {
  content.innerHTML = `<div class="loader">Loading...</div>`;

  const currentUserId = sessionState.user?.id;

  const artworks = await fetchArtworksByUserId(currentUserId, profile.id);

  const artworkContainer = document.createElement("div");
  artworkContainer.classList.add("artwork-container");

  
  content.innerHTML = "";
  
  const sectionHeader = document.createElement("div");
  sectionHeader.classList.add("section-header");
  sectionHeader.innerHTML = `
  <h3>Artworks</h3>
  `;
  content.append(sectionHeader);
  
  
  if (artworks.length === 0) {
    isOwner = sessionState.user?.id === profile.id;
        
    await createEmptyState({
      container: content,
      icon: "📭",
      title: "Nothing here yet",
      description:
        isOwner
          ? "You have no artworks yet"
          : `@${profile.username} has no artworks yet`,
      actionText: isOwner ? "Upload Artwork" : null,
      onAction: isOwner
        ? async () => {
            // Open modal
    await loadComponent(
          "https://joincanvart.vercel.app/components/modals/create/upload-artwork",
          "modalContainer",
        );

        await uploadArtwork(
   "artworkInput",
   "imagePreview",
   "artworkTitle",
   "artworkDescription",
   "uploadArtworkBtn",
 );
   }
        : null,
    });

    return;
  }
  
  await createArtworkCard(artworkContainer, artworks);
  content.append(artworkContainer);
}

async function showCollections(content) {
  content.innerHTML = `<div class="loader">Loading...</div>`;

  const collections = await fetchCollectionsByUserId(profile.id);

  const collectionContainer = document.createElement("div");
  collectionContainer.classList.add("collection-container");

  content.innerHTML = "";

  const sectionHeader = document.createElement("div");
  sectionHeader.classList.add("section-header");
  sectionHeader.innerHTML = `<h3>Collections</h3>`;
  content.append(sectionHeader);

  if (collections.length === 0) {
         isOwner = sessionState.user?.id === profile.id;
        
    await createEmptyState({
      container: content,
      icon: "📭",
      title: "Nothing here yet",
      description: isOwner
        ? "You have no collections yet"
        : `@${profile.username} has no collections yet`,
      actionText: isOwner ? "Create Collection" : null,
      onAction: isOwner
        ? async () => {
            // Open modal
            await loadComponent(
              "https://joincanvart.vercel.app/components/modals/create/create-collection",
              "modalContainer",
            );
            // Wire up the createCollection behavior for that modal
            await createCollection(
              "collectionThumbnailInput",
              "imagePreview",
              "collectionName",
              "collectionDescription",
              "createCollectionBtn",
            );
          }
        : null,
    });

    return;
  }

  await createCollectionCard(collectionContainer, collections);

  content.append(collectionContainer);
}


async function renderProfile(profile) {
  document.getElementById("profileName").textContent =
    profile.name || "Unknown User";

  document.getElementById("profileUsername").textContent =
    "@" + profile.username;

  document.getElementById("profileBio").textContent =
    profile.bio || "No bio yet";

  const profileAvatar = document.getElementById("profileAvatar")
  profileAvatar.src = profile.avatar_url || "assets/images/default-avatar.png";

  await magnifyImg(profileAvatar)
}

async function handleProfileEdit() {
  const editProfileBtn = document.getElementById("profileEdit");
  if (editProfileBtn) {
      editProfileBtn.addEventListener("click", async () => {
        if (!sessionState.user) {
          window.location.href = "/"

          return;
        }
        await loadComponent(
          "https://joincanvart.vercel.app/components/modals/edit/edit-profile.html",
          "modalContainer",
        );
        await updateProfile(
          "avatarInput",
          "imagePreview",
          "name",
          "username",
          "email",
          "bio",
          "profileEditBtn",
        );
      });
  }
}

async function initProfile() {
  await sessionReady;

  const artworksBtn = document.getElementById("viewArtworksBtn");
  const collectionsBtn = document.getElementById("viewCollectionsBtn");
  const content = document.getElementById("profileContent");

  if (!artworksBtn || !collectionsBtn || !content) {
    console.error("Missing profile UI elements");
    return;
  }

  const username = getUsername();

  if (!username) {
    toastMsg("Invalid profile URL", "error");
    return;
  }

  profile = await fetchArtistProfile(username);

  if (!profile) {
    toastMsg("Artist not found", "error");
    return;
  }

   await authUser(profile);

  await renderProfile(profile);

  await showArtworks(content);
  await setActive(artworksBtn);

  artworksBtn.addEventListener("click", async () => {
    setActive(artworksBtn);
    await showArtworks(content);
  });

  collectionsBtn.addEventListener("click", () => {
    setActive(collectionsBtn);
    showCollections(content);
  });

  await handleProfileEdit();
}

document.addEventListener("DOMContentLoaded", initProfile);
