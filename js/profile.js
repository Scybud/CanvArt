import { fetchArtistProfile } from "./data/artists.js";
import { toastMsg } from "./components/toast.js";

// Extract username from either /profile/<username> or ?user=<username>
function getUsername() {
  const url = new URL(window.location.href);

  // 1. Try query param first: profile.html?user=abdul
  const queryUser = url.searchParams.get("user");
  if (queryUser) return queryUser.trim();

  // 2. Try path: /profile/abdul
  const parts = url.pathname.split("/").filter(Boolean);
  let last = parts.pop();

  // Remove .html if present
  if (last && last.endsWith(".html")) {
    last = last.replace(".html", "");
  }

  return last || null;
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

    // Render profile (your function)
    renderProfile(profile);
  } catch (err) {
    console.error("Profile loading error:", err);
    toastMsg("Something went wrong loading the profile", "error");
  }
}

await initProfile();
