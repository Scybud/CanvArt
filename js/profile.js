import { fetchArtistProfile } from "./data/artists.js";
import { fetchArtworksByUserId } from "./data/artworks.js";
import { toastMsg } from "./components/toast.js";
import { createArtworkCard } from "./components/artworkCard.js";
import { uploadArtwork } from "./uploadArtwork.js";

let profile = null;

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

async function showArtworks(content) {
  content.innerHTML = `<div class="loader">Loading...</div>`;

  const artworks = await fetchArtworksByUserId(profile.id);

const artworkContainer = document.createElement("div")
artworkContainer.classList.add("artwork-container");


await createArtworkCard(artworkContainer, artworks);

content.innerHTML = "";

const sectionHeader = document.createElement("div");
 sectionHeader.classList.add("section-header");
sectionHeader.innerHTML = `
<h3>Artworks</h3>
`;
content.append(sectionHeader);

  content.append(artworkContainer);
}

function showCollections(content) {
  content.innerHTML = `
    <h3>Collections</h3>
    <p>No collections yet.</p>
  `;
}

function renderProfile(profile) {
  document.getElementById("profileName").textContent =
    profile.name || "Unknown User";

  document.getElementById("profileUsername").textContent =
    "@" + profile.username;

  document.getElementById("profileBio").textContent =
    profile.bio || "No bio yet";

  document.getElementById("profileAvatar").src =
    profile.avatar_url || "assets/images/default-avatar.png";
}

async function initProfile() {
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

  renderProfile(profile);

  showArtworks(content);
  setActive(artworksBtn);

  artworksBtn.addEventListener("click", () => {
    setActive(artworksBtn);
    showArtworks(content);
  });

  collectionsBtn.addEventListener("click", () => {
    setActive(collectionsBtn);
    showCollections(content);
  });
}

document.addEventListener("DOMContentLoaded", initProfile);
