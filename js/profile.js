import { fetchArtistProfile } from "./data/artists.js";
import { toastMsg } from "./components/toast.js";

// Extract username from either /profile/<username> or ?user=<username>
function getUsername() {
  const parts = window.location.pathname.split("/").filter(Boolean);

  if (parts[0] === "profile" && parts[1]) {
    return parts[1];
  }

  return null;
}

async function initProfile() {
  try {
    const username = getUsername();

    if (!username) {
      toastMsg("User with that username does not exist", "error");
      console.log("No username found in URL");
      return;
    }

    const profile = await fetchArtistProfile(username);

    if (!profile) {
      toastMsg("Artist not found", "error");
      console.log("Artist not found:", username);
      return;
    }

    // Render profile
    renderProfile(profile);

    showArtworks(profile);

    artworksBtn.addEventListener("click", () => {
      setActive(artworksBtn);
      showArtworks(profile);
    });

    collectionsBtn.addEventListener("click", () => {
      setActive(collectionsBtn);
      showCollections(profile);
    });
  } catch (err) {
    console.error("Profile loading error:", err);
    toastMsg("Something went wrong loading the profile", "error");
  }
}

await initProfile();

const artworksBtn = document.getElementById("viewArtworksBtn");
const collectionsBtn = document.getElementById("viewCollectionsBtn");
const content = document.getElementById("profileContent");

function setActive(button) {
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  button.classList.add("active");
}

function showArtworks(profile) {
  content.innerHTML = `
    <h3>Artworks</h3>
    <p>No artworks yet.</p>
  `;
}

function showCollections(profile) {
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