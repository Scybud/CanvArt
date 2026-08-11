import { supabase } from "./supabase.js";
import { initShareButton } from "./utils/shareItem.js";
import { handleArtworkLike } from "./utils/button.js";
import { toastMsg } from "./components/toast.js";
import { enrichArtworksWithLikes } from "./data/artworkLikes.js";
import { sessionReady, sessionState } from "./session.js";
import {
  handleContentDelete,
  handleContentReport,
} from "./create/contentActions.js";
import {
  loadComponent,
  magnifyImg,
} from "https://scybud.github.io/scybud-ui/js/ui.js";

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

  // Enrich with like data
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
  <path d="M3 6h18" />
  <path d="M8 6l1-2h6l1 2" />
  <rect x="5" y="6" width="14" height="14" rx="2" />
  <path d="M10 11v6" />
  <path d="M14 11v6" />
</svg>Delete`;
    reportOrDeleteBtn.classList.add("danger");

    await handleContentDelete(
      artwork.id,
      "artworks",
      reportOrDeleteBtn,
      "Are you sure you want to delete this artwork?",
    );
  } else {
    reportOrDeleteBtn.innerHTML = `<svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M7 3h7l5 5v13H7V3z"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M14 3v5h5"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
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

    reportOrDeleteBtn.addEventListener("click", async () => {
      await loadComponent(
        "/components/modals/report-content.html",
        "modalContainer",
      );

      await handleContentReport(
        artwork,
        `https://joincanvart.vercel.app/artwork/${artwork?.id}`,
        "contentUrl",
        "reporterUsername",
        "reasonForReport",
        "reportDetails",
        "reportContentBtn",
      );
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

  // ENGAGEMENT SECTION (Likes + Share)
  const engagementContainer = document.createElement("div");
  engagementContainer.classList.add("engagementContainer");

  // Like Button Setup
  const likeBtn = document.createElement("button");
  likeBtn.classList.add("likeBtn", "icon-btn");

  const likeIcon = document.createElement("span");
  likeIcon.classList.add("likeIcon");
  likeIcon.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  `;

  if (artwork.is_liked) {
    likeIcon.classList.add("liked");
  }

  const likeCount = document.createElement("span");
  likeCount.classList.add("likeCount");
  likeCount.textContent = artwork.like_count || 0;

  likeBtn.append(likeIcon, likeCount);
  engagementContainer.append(likeBtn);

  // Share Button Setup
  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.classList.add("icon-btn", "shareArtworkBtn");
  shareBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5" r="2" fill="currentColor" />
      <circle cx="6" cy="12" r="2" fill="currentColor" />
      <circle cx="18" cy="19" r="2" fill="currentColor" />
      <path d="M8 11L16 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <path d="M8 13L16 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </svg>
  `;
  engagementContainer.append(shareBtn);

  // Append container to page tree
  document.querySelector(".artwork-data").appendChild(engagementContainer);

  // Initialize Share Functionality
  initShareButton(
    shareBtn,
    artwork.title,
    artwork.description,
    window.location.href,
  );

  // Initialize Like Functionality
  await handleArtworkLike({
    likeBtn,
    artworkId: artwork.id,
    likeCount,
    likeIcon,
  });

  // Magnify
  magnifyImg(img);
})();
