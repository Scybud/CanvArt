import { supabase } from "./supabase.js";
import { initShareButton } from "./utils/shareItem.js";
import { handleArtworkLike } from "./utils/button.js";
import { toastMsg } from "./components/toast.js";
import { magnifyImg } from "https://scybud.github.io/scybud-ui/js/ui.js";
import { enrichArtworksWithLikes } from "./data/artworkLikes.js";
import { sessionReady, sessionState } from "./session.js";

function getArtworkId() {
  const url = new URL(window.location.href);

  const queryArt = url.searchParams.get("art");
  if (queryArt) return queryArt;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "artwork" && parts[1]) return parts[1];

  return null;
}

(async function initArtworkPage() {
    await sessionReady;

  const artworkId = getArtworkId();

  if (!artworkId) {
    document.querySelector(".artwork-container").innerHTML =
      "<p>Artwork not found.</p>";
    return;
  }

  // Fetch raw artwork
  const { data: artworkRaw, error } = await supabase
    .from("artworks")
    .select("*, profiles(*)")
    .eq("id", artworkId)
    .single();

  if (error || !artworkRaw) {
    document.querySelector(".artwork-container").innerHTML =
      "<p>Artwork not found.</p>";
    return;
  }

  // Enrich with like data (same as Explore)
  const userId = sessionState?.user?.id || null;
  const [artwork] = await enrichArtworksWithLikes([artworkRaw], userId);

  // Artist link
  document.getElementById("artistBtn").href =
    `/profile/${artwork.profiles.username}`;

  // Report/Delete button
  const reportOrDeleteBtn = document.getElementById("reportOrDeleteBtn");

  if (artwork.user_id === userId) {
    reportOrDeleteBtn.innerHTML = ` <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <!-- Lid -->
  <path d="M3 6h18" />
  <path d="M8 6l1-2h6l1 2" />
  <!-- Bin -->
  <rect x="5" y="6" width="14" height="14" rx="2" />
  <!-- Lines -->
  <path d="M10 11v6" />
  <path d="M14 11v6" />
</svg>Delete`;
    reportOrDeleteBtn.classList.add("danger");

    reportOrDeleteBtn.addEventListener("click", async () => {
      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", artwork.id);

      if (!error) {
        await toastMsg("Artwork deleted", "success");
        history.back();
      }
    });
  } else {
    reportOrDeleteBtn.innerHTML = `<svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Document shape -->
  <path
    d="M7 3h7l5 5v13H7V3z"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <!-- Folded corner -->
  <path
    d="M14 3v5h5"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <!-- Report lines -->
  <path
    d="M10 11h6"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
  />
  <path
    d="M10 14h6"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
  />
  <path
    d="M10 17h4"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
  />
</svg> Report`;

    reportOrDeleteBtn.addEventListener("click", () => {
      toastMsg("Reported. Our team will review it.", "success");
    });
  }

  // Populate UI
  const img = document.getElementById("artworkImg");
  const title = document.getElementById("artworkTitle");
  const description = document.getElementById("artworkDescription");

  img.src = artwork.artwork_url;
  title.textContent = artwork.title;
  description.textContent = artwork.description;

  // Controls
  const backBtn = document.getElementById("backBtn");
  const menuToggle = document.getElementById("menuToggle");
  const artworkMenu = document.getElementById("artworkMenu");

  backBtn.addEventListener("click", () => history.back());
  menuToggle.addEventListener("click", () => (artworkMenu.hidden ^= 1));

  // Share
  const shareBtn = document.querySelector(".shareArtworkBtn");

  initShareButton(
    shareBtn,
    artwork.title,
    artwork.description,
    window.location.href,
  );

  // Like (using enriched data)
  const likeBtn = document.createElement("button");
  likeBtn.classList.add("likeBtn", "icon-btn");

  const likeIcon = document.createElement("span");
  likeIcon.textContent = artwork.is_liked ? "♥" : "♡";
  if (artwork.is_liked) likeIcon.classList.add("liked");

  const likeCount = document.createElement("span");
  likeCount.classList.add("likeCount");
  likeCount.textContent = artwork.like_count || 0;

  likeBtn.append(likeIcon, likeCount);

  const likeContainer = document.createElement("div");
  likeContainer.classList.add("likeContainer");
  likeContainer.append(likeBtn);

  document.querySelector(".artwork-data").appendChild(likeContainer);

  await handleArtworkLike({
    likeBtn,
    artworkId: artwork.id,
    likeCount,
    likeIcon,
  });

  // Magnify
  magnifyImg(img);
})();
