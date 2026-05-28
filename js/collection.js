import { fetchCollectionById } from "./data/collections.js";
import { createArtworkCard } from "./components/artworkCard.js";
import { toastMsg } from "./components/toast.js";

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

async function showArtworks() {
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
  `;

  content.append(sectionHeader);
  content.append(artworkContainer);
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

  await showArtworks();
}

document.addEventListener("DOMContentLoaded", initCollection);
