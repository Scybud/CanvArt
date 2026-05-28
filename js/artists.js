import { createArtistCard } from "./components/artistsCard.js";
import { fetchAllArtists, fetchFeaturedArtists } from "./data/artists.js";

let allArtists = [];

async function initArtistsPage() {
  const grid = document.getElementById("artistsGrid");
  const featured = document.getElementById("featuredArtists");
  const searchInput = document.getElementById("artistSearchInput");

  // LOAD DATA
  allArtists = await fetchAllArtists();
  const featuredArtists = await fetchFeaturedArtists();

  // RENDER FEATURED (simple HTML-like rendering)
  renderFeatured(featured, featuredArtists);

  // RENDER GRID
  createArtistCard(grid, allArtists);

  // SEARCH
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();

    const filtered = allArtists.filter((artist) => {
      return (
        artist.name.toLowerCase().includes(value) ||
        artist.username.toLowerCase().includes(value)
      );
    });

    grid.innerHTML = "";
    createArtistCard(grid, filtered);
  });
}

function renderFeatured(container, artists) {
  container.innerHTML = "";

  artists.forEach((artist) => {
    const a = document.createElement("a");
    a.classList.add("featured-artist-card");
    a.href = `/profile?user=${artist.username}`;

    const img = document.createElement("img");
    img.classList.add("featured-artist-avatar");
    img.src = artist.avatar_url;

    const name = document.createElement("span");
    name.classList.add("featured-artist-name");
    name.textContent = artist.name;

    const username = document.createElement("span");
    username.classList.add("featured-artist-username");
    username.textContent = `@${artist.username}`;

    a.appendChild(img);
    a.appendChild(name);
    a.appendChild(username);

    container.appendChild(a);
  });
}

initArtistsPage();
