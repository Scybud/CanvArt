import {
  loadComponent,
  closeModal,
} from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { sessionReady, sessionState } from "./session.js";
import { uploadArtwork } from "./create/uploadArtwork.js";
import { fetchAllArtworks } from "./data/artworks.js";
import { createArtworkCard } from "./components/artworkCard.js";
import { fetchFeaturedArtists, fetchAllArtists } from "./data/artists.js"; // adjust path if needed
import { enrichArtworksWithLikes } from "./data/artworkLikes.js";

async function initExplore() {
  await sessionReady;
  const user = sessionState.user;

  await handleArtworkUpload();

  const artworks = await fetchAllArtworks();

  const artworksData = await enrichArtworksWithLikes(artworks, user.id);

  const exploreContainer = document.getElementById("explore");
  await createArtworkCard(exploreContainer, artworksData);

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

  const uploadArtworkBtns = document.querySelectorAll(".upload-artwork");
  if (uploadArtworkBtns) {
    uploadArtworkBtns.forEach(async (btn) => {
      btn.addEventListener("click", async () => {
        if (!sessionState.user) {
          await loadComponent(
            "https://joincanvart.vercel.app/components/modals/request-auth",
            "modalContainer",
          );

          return;
        }
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

initExplore();
