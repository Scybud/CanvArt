import {
  loadComponent,
} from "https://scybud.github.io/scybud-ui/js/ui.js";
import { sessionReady, sessionState } from "./session.js";
import { uploadArtwork } from "./create/uploadArtwork.js";
import { fetchArtworks } from "./data/artworks.js"; 
import { createArtworkCard } from "./components/artworkCard.js";
import { fetchFeaturedArtists } from "./data/artists.js";
import { enrichArtworksWithLikes } from "./data/artworkLikes.js";
import { fetchCollectionsByCount } from "./data/collections.js";
import { createCollectionCard } from "./components/collectionCard.js";

const LIMIT = 10; // how many cards per batch
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let allLoadedArtworks = []; // track of what we've already rendered

async function initGallery() {
  await sessionReady;
  const user = sessionState.user;

  await handleArtworkUpload();

  // Initial load
  await loadMoreArtworks(user);

  // Infinite scroll listener
  setupInfiniteScroll(user);

  await renderFeaturedArtists();
  await renderTrendingCollections();

  // Artists modal button
  const showArtistsListModalBtn = document.getElementById(
    "showArtistsListModal",
  );
  if (showArtistsListModalBtn) {
    showArtistsListModalBtn.addEventListener("click", async () => {
      await loadComponent("/components/modals/artists-list", "modalContainer");
      await renderFeaturedArtistsList();
    });
  }
}

async function loadMoreArtworks(user) {
  if (isLoading || !hasMore) return;

  isLoading = true;
  showLoader(true); 

  try {
    const newArtworks = await fetchArtworks({
      page: currentPage,
      limit: LIMIT,
    });

    if (!newArtworks || newArtworks.length === 0) {
      hasMore = false;
      showLoader(false);
      return;
    }

    // Enrich only the new batch
    const enriched = await enrichArtworksWithLikes(newArtworks, user?.id);

    const exploreContainer = document.getElementById("gallery");
    await createArtworkCard(exploreContainer, enriched, user); // appends, doesn't replace

    allLoadedArtworks = [...allLoadedArtworks, ...enriched];
    currentPage += 1;

    // If we got fewer than LIMIT, we've reached the end
    if (newArtworks.length < LIMIT) {
      hasMore = false;
    }
  } catch (err) {
    console.error("Failed to load more artworks:", err);
  } finally {
    isLoading = false;
    showLoader(false);
  }
}

function setupInfiniteScroll(user) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreArtworks(user);
      }
    },
    {
      rootMargin: "300px", // start loading a bit before the user hits the bottom
    },
  );

  // Create a sentinel element at the bottom of the gallery
  let sentinel = document.getElementById("scroll-sentinel");
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = "scroll-sentinel";
    sentinel.style.height = "1px";
    document.getElementById("gallery").after(sentinel);
  }

  observer.observe(sentinel);
}

// loader
function showLoader(show) {
  let loader = document.getElementById("gallery-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "gallery-loader";
    loader.className = "gallery-loader";
    loader.innerHTML = `<div class="spinner"></div>`;
    document.getElementById("gallery").after(loader);
  }
  loader.style.display = show ? "flex" : "none";
}

async function handleArtworkUpload() {
  const uploadArtworkBtns = document.querySelectorAll(".upload-artwork");
  if (uploadArtworkBtns) {
    uploadArtworkBtns.forEach(async (btn) => {
      btn.addEventListener("click", async () => {
        if (!sessionState.user) {
          await loadComponent(
            "/components/modals/request-auth",
            "modalContainer",
          );

          return;
        }
        await loadComponent(
          "/components/modals/create/upload-artwork",
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

async function renderTrendingCollections() {
  const container = document.getElementById("trendingCollections");

  container.innerHTML = "";

  const collections = await fetchCollectionsByCount(3);

  if (!collections || collections.length === 0) {
    container.innerHTML = "<p>No trending collections this week.</p>";
    return;
  }

  await createCollectionCard(container, collections);
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

initGallery();
