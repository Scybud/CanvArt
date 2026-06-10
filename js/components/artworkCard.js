import { initAddToCollectionModal } from "../create/addToCollection.js";
import {
  handleContentDelete,
  handleContentReport,
} from "../create/contentActions.js";
import { handleArtworkLike } from "../utils/button.js";
import { initShareButton } from "../utils/shareItem.js";
import {
  loadComponent,
  closeModal,
  magnifyImg,
} from "https://scybud.github.io/scybud-ui/js/ui.js";
import {linkify} from "../utils/linkify.js"

export async function createArtworkCard(container, artworks, user) {
  for (const artwork of artworks) {
    const artworkItem = document.createElement("div");
    artworkItem.classList.add("artworkItem", "card");

    // IMAGE CONTAINER
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("imgContainer");
    artworkItem.appendChild(imgContainer);

    const img = document.createElement("img");
    img.classList.add("artwork");
    img.src = artwork.artwork_url; // FIXED
    img.alt = artwork.description || "Artwork";
    img.loading = "lazy";
    imgContainer.appendChild(img);

    //ARTWORK MENU
    const artworkMenu = document.createElement("div");
    artworkMenu.classList.add("artworkMenu");
    artworkMenu.hidden = true;
    artworkMenu.innerHTML = `
    <nav class="artwork-menu-btns">
        <a class="btn" href="/artwork/${artwork.id}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
  <circle cx="12" cy="12" r="3" fill="currentColor"/>
</svg>
View
</a>


    <a class="btn" href="/profile/${artwork.profiles.username}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 3c-4.4 0-8 2.9-8 7s3.6 7 8 7c1.2 0 2-.8 2-1.8 0-.9-.7-1.7-1.6-1.9 2.7-.2 4.6-2.2 4.6-4.3 0-3.1-2.6-5-5-5z"/>
  <circle cx="9" cy="10" r="0.8" fill="currentColor"/>
  <circle cx="12" cy="8" r="0.8" fill="currentColor"/>
  <circle cx="14" cy="11" r="0.8" fill="currentColor"/>
</svg> Artist</a>

${
  user?.id === artwork?.user_id ? `<button class="btn addToCollectionBtn">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 8v8M8 12h8"/>
  </svg>
  Add to Collection
</button>
` : ""
}

${
  user?.id !== artwork?.user_id
    ? `<button class="btn danger reportArtwork"><svg
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
</svg> Report</button>
`
    : `<button class="btn danger deleteArtwork"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 6h18" />
  <path d="M8 6l1-2h6l1 2" />
  <rect x="5" y="6" width="14" height="14" rx="2" />
  <path d="M10 11v6" />
  <path d="M14 11v6" />
</svg> Delete</button>`
}
  </nav>
    `;
    imgContainer.appendChild(artworkMenu);

    const menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.innerHTML = `<svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle cx="12" cy="5" r="1.8" fill="currentColor" />
  <circle cx="12" cy="12" r="1.8" fill="currentColor" />
  <circle cx="12" cy="19" r="1.8" fill="currentColor" />
</svg>
`;
    menuBtn.classList.add("menuToggle");
    menuBtn.addEventListener("click", () => {
      artworkMenu.hidden ^= 1;
    });
    imgContainer.appendChild(menuBtn);

    // OWNER INFO (inside image)
    const ownerInfo = document.createElement("div");
    ownerInfo.classList.add("ownerInfo");

    // Avatar
    const avatar = document.createElement("img");
    avatar.classList.add("ownerAvatar");
    avatar.src = artwork.profiles.avatar_url;
    avatar.alt = artwork.profiles.name;
    ownerInfo.appendChild(avatar);

    // Name + username wrapper
    const ownerText = document.createElement("div");
    ownerText.classList.add("ownerText");

    const ownerName = document.createElement("p");
    ownerName.classList.add("ownerName");
    ownerName.textContent = artwork.profiles.name;
    ownerText.appendChild(ownerName);

    const ownerUsername = document.createElement("a");
    ownerUsername.classList.add("ownerUsername");
    ownerUsername.textContent = `@${artwork.profiles.username}`;
    ownerUsername.href = `/profile/${artwork.profiles.username}`;
    ownerText.appendChild(ownerUsername);

    ownerInfo.appendChild(ownerText);
    imgContainer.appendChild(ownerInfo);

    // ARTWORK CONTENT
    const artworkContent = document.createElement("div");
    artworkContent.classList.add("artworkContent");

    const title = document.createElement("span");
    title.classList.add("text-bold");
    title.textContent = artwork.title;
    artworkContent.appendChild(title);

    const description = document.createElement("p");
    description.innerHTML = linkify(artwork.description);
    artworkContent.appendChild(description);

    artworkItem.appendChild(artworkContent);

    // LIKE & SHARE SECTION
    const engagementContainer = document.createElement("div");
    engagementContainer.classList.add("engagementContainer");

    // Like Button
    const likeBtn = document.createElement("button");
    likeBtn.classList.add("likeBtn", "icon-btn");

    // Replaced text character with SVG element wrapper
    const likeIcon = document.createElement("span");
    likeIcon.classList.add("likeIcon");
    likeIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;

    // Add active styling configuration
    if (artwork.is_liked) {
      likeIcon.classList.add("liked");
    }

    const likeCount = document.createElement("span");
    likeCount.classList.add("likeCount");
    likeCount.textContent = artwork.like_count || 0;

    likeBtn.appendChild(likeIcon);
    likeBtn.appendChild(likeCount);
    engagementContainer.appendChild(likeBtn);

    // Share Button
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
    engagementContainer.appendChild(shareBtn);

    artworkItem.append(engagementContainer);

    // Append card to container
    container.prepend(artworkItem);

    // Initialize Share Functionality
    initShareButton(
      shareBtn,
      "Check out this artwork",
      "Found an amazing masterpiece on CanvArt",
      `/artwork/${artwork?.id}`,
    );

    const addToCollectionBtn = artworkItem.querySelector(".addToCollectionBtn");
    if(addToCollectionBtn) {
      addToCollectionBtn.addEventListener("click", async () => {
        await loadComponent(
          "../components/modals/create/add-to-collection.html",
          "modalContainer",
        );

        await initAddToCollectionModal(artwork?.id);
    });
  }

    const reportBtn = artworkItem.querySelector(".reportArtwork");
    if (reportBtn) {
      reportBtn.addEventListener("click", async () => {
        await loadComponent(
          "../components/modals/report-content.html",
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

    const deleteArtwork = artworkItem.querySelector(".deleteArtwork");
    if (deleteArtwork) {
      await handleContentDelete(
        artwork.id,
        "artworks",
        deleteArtwork,
        "Are you sure you want to delete this artwork?",
      );
    }

    magnifyImg(img);

    await handleArtworkLike({
      likeBtn,
      artworkId: artwork.id,
      likeCount,
      likeIcon,
    });
  }
}
