import { fetchCollectionById } from "./data/collections.js";
import { createArtworkCard } from "./components/artworkCard.js";
import { toastMsg } from "./components/toast.js";
import {
  loadComponent,
  closeModal,
} from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { addArtworkToCollection } from "./create/uploadArtwork.js";

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
  document.getElementById("collectionName").textContent =
    collection.name || "Untitled Collection";

  document.getElementById("collectionDescription").textContent =
    collection.description || "No description";

  document.getElementById("collectionThumbnail").src =
    collection.thumbnail_url || "../assets/images/default-avatar.png";
}

async function showArtworks(collectionId) {
  const content = document.getElementById("collectionContent");

  content.innerHTML = `<div class="loader">Loading...</div>`;

  const artworkContainer = document.createElement("div");
  artworkContainer.classList.add("artwork-container");

  const artworks = collection.collection_artworks.map((item) => item.artworks);

  await createArtworkCard(artworkContainer, artworks);

  content.innerHTML = "";

  const sectionHeader = document.createElement("div");
  sectionHeader.classList.add("section-header");

  sectionHeader.innerHTML = `
    <h3>Collection Artworks</h3>
    <button id="addArtworkBtn" class="btn" type="button">
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
      "https://joincanvart.vercel.app/components/modals/create/upload-artwork",
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

async function initCollection() {
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

  await showArtworks(collectionId);
  
}

document.addEventListener("DOMContentLoaded", initCollection);
