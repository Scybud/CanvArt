import { fetchCollectionById } from "./data/collections.js";
import { createArtworkCard } from "./components/artworkCard.js";
import { toastMsg } from "./components/toast.js";
import {
  loadComponent,
  closeModal
} from "https://scybud.github.io/scybud-ui/js/ui.js";
import { addArtworkToCollection } from "./create/uploadArtwork.js";
import { enrichArtworksWithLikes } from "./data/artworkLikes.js";
import { sessionReady, sessionState } from "./session.js";
import { updateCollection } from "./edit/editCollection.js";

let collection = null;

function getCollectionId() {
  const url = new URL(window.location.href);

  const queryCollection = url.searchParams.get("c");
  if (queryCollection) return queryCollection;

  const parts = url.pathname.split("/").filter(Boolean);

  if (parts[0] === "collection" && parts[1]) {
    return parts[1];
  }

  return null;
}

function renderCollection(collection) {
  document.title = collection.name  + " | CanvArt";

  document.getElementById("collectionName").textContent =
    collection.name || "Untitled Collection";

  document.getElementById("collectionDescription").textContent =
    collection.description || "No description";

  document.getElementById("collectionThumbnail").src =
    collection.thumbnail_url || "../assets/images/default-avatar.png";
}

async function showArtworks(collectionId, user) {

  const content = document.getElementById("collectionContent");

  content.innerHTML = `<div class="loader">Loading...</div>`;

  const artworkContainer = document.createElement("div");
  artworkContainer.classList.add("artwork-container");

  const artworks = collection.collection_artworks.map((item) => item.artworks);

  const enriched = await enrichArtworksWithLikes(artworks, user?.id);

  await createArtworkCard(artworkContainer, enriched, user);

  content.innerHTML = "";

  const sectionHeader = document.createElement("div");
  sectionHeader.classList.add("section-header");

  sectionHeader.innerHTML = `
    <h3>Collection Artworks</h3>
    <button id="addArtworkBtn" class="btn btn-primary" type="button">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 5v14" />
  <path d="M5 12h14" />
</svg>
Add Artwork</button>
  `;

  content.append(sectionHeader);
  content.append(artworkContainer);

  await handleArtworkUploadToCollection("addArtworkBtn", collectionId);
}

async function handleArtworkUploadToCollection(addToCollectionArtworkBtn, collectionId) {
  const addArtworkBtn = document.getElementById(addToCollectionArtworkBtn);

  addArtworkBtn.addEventListener("click", async () => {
    await loadComponent(
      "/components/modals/create/upload-artwork",
      "modalContainer",
    );

    await addArtworkToCollection(
      "artworkInput",
      "imagePreview",
      "artworkTitle",
      "artworkDescription",
      collectionId,
      "uploadArtworkBtn",
    );
  });
}


async function handleCollectionEdit() {
  const editCollectionBtn = document.getElementById("collectionEdit");
  if (editCollectionBtn) {
      editCollectionBtn.addEventListener("click", async () => {
        if (!sessionState.user) {
          window.location.href = "/"

          return;
        }
        await loadComponent(
          "/components/modals/edit/edit-collection.html",
          "modalContainer",
        );
        await updateCollection(
          collection.id,
          "collectionThumbnailInput",
          "imagePreview",
          "collectionName",
          "collectionDescription",
          "EditCollectionBtn",
        );
      });
  }
}


async function initCollection() {
    await sessionReady;

   const user = await sessionState.user;

  const collectionId = getCollectionId();

  if (!collectionId) {
    toastMsg("Invalid collection URL", "error");
    return;
  }

  collection = await fetchCollectionById(collectionId);

  if (!collection) {
    toastMsg("Collection not found", "error");
    return;
  }

  renderCollection(collection);

  await showArtworks(collectionId, user);
  
  if(collection.user_id !== user?.id) {
    const addArtworkBtn = document.getElementById("addArtworkBtn");
  const editCollectionBtn = document.getElementById("collectionEdit");

    if(addArtworkBtn)  addArtworkBtn.remove();
    if(editCollectionBtn) editCollectionBtn.remove();
    }
  
    await handleCollectionEdit();
}

document.addEventListener("DOMContentLoaded", initCollection);
