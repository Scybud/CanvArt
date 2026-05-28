import {
  loadComponent,
  closeModal,
} from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { sessionState } from "./session.js";
import { createCollection } from "./create/createCollection.js";
import { fetchFeaturedArtists } from "./data/artists.js";
import { fetchAllCollections } from "./data/collections.js";
import { createCollectionCard } from "./components/collectionCard.js";

async function initCollections() {
  await handleArtworkUpload();

  const collectionsData = await fetchAllCollections();

  const collectionsContainer = document.getElementById("collectionsGrid");
  createCollectionCard(collectionsContainer, collectionsData);

  await renderFeaturedArtists();
}

async function handleArtworkUpload() {
  const showArtistsListModalBtn = document.getElementById(
    "showArtistsListModal",
  );
  if (showArtistsListModalBtn) {
    showArtistsListModalBtn.addEventListener("click", async () => {
      await loadComponent(
        "https://joincanvart.vercel.app/components/modals/artists-list",
        "modalContainer",
      );

      await renderFeaturedArtistsList();
    });
  }

  const createCollectionBtn = document.querySelectorAll(".create-collection");
  if (createCollectionBtn) {
    createCollectionBtn.forEach(async (btn) => {
      btn.addEventListener("click", async () => {
        if (!sessionState.user) {
          await loadComponent(
            "./components/modals/request-auth",
            "modalContainer",
          );

          return;
        }
        await loadComponent(
          "./components/modals/create/create-collection",
          "modalContainer",
        );
        await createCollection(
          "collectionThumbnailInput",
          "imagePreview",
          "collectionName",
          "collectionDescription",
          "createCollectionBtn",
        );
      });
    });
  }
}

async function renderFeaturedArtists() {
  const container = document.getElementById("featuredArtists");
  container.innerHTML = ""; // clear

  const artists = await fetchFeaturedArtists(4);

  if (!artists || artists.length === 0) {
    container.innerHTML = "<p>No featured artists this week.</p>";
    return;
  }

  artists.forEach((artist) => {
    const card = document.createElement("a");
    card.href = `/profile/${artist.username}`;
    card.className = "featured-artist-card";

    card.innerHTML = `
      <img src="${artist.avatar_url}" class="featured-artist-avatar" alt="${artist.username}">
      <span class="featured-artist-name">${artist.name}</span>
      <span class="featured-artist-username">@${artist.username}</span>
    `;

    container.appendChild(card);
  });
}

async function renderFeaturedArtistsList() {
  const container = document.getElementById("artistsListBody");
  container.innerHTML = "";

  const artists = await fetchFeaturedArtists(10);

  artists.forEach((artist) => {
    const row = document.createElement("a");
    row.href = `/profile/${artist.username}`;
    row.className = "artist-row";

    row.innerHTML = `
      <img src="${artist.avatar_url}" class="artist-avatar" alt="${artist.username}">
      <div class="artist-info">
        <span class="artist-name">${artist.name}</span>
        <span class="artist-username">@${artist.username}</span>
      </div>
    `;

    container.appendChild(row);
  });
}

initCollections();
