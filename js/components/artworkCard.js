import { handleArtworkLike } from "../utils/button.js";
import { initShareButton } from "../utils/shareItem.js";

export async function createArtworkCard(container, artworks, user) {
  for(const artwork of artworks) {
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
    <button type="button" class="btn shareArtworkBtn"><svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Share nodes -->
  <circle cx="18" cy="5" r="2" fill="currentColor" />
  <circle cx="6" cy="12" r="2" fill="currentColor" />
  <circle cx="18" cy="19" r="2" fill="currentColor" />

  <!-- Connecting lines -->
  <path
    d="M8 11L16 6"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
  />
  <path
    d="M8 13L16 18"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
  />
</svg> Share</button>

    <a class="btn" href="/profile/${artwork.profiles.username}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <!-- Artist palette -->
  <path d="M12 3c-4.4 0-8 2.9-8 7s3.6 7 8 7c1.2 0 2-.8 2-1.8 0-.9-.7-1.7-1.6-1.9 2.7-.2 4.6-2.2 4.6-4.3 0-3.1-2.6-5-5-5z"/>
  <!-- Paint holes -->
  <circle cx="9" cy="10" r="0.8" fill="currentColor"/>
  <circle cx="12" cy="8" r="0.8" fill="currentColor"/>
  <circle cx="14" cy="11" r="0.8" fill="currentColor"/>
</svg> Artist</a>

${
  user.id !== artwork?.user_id
    ? `    <button class="btn danger reportArtwork"><svg
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
</svg> Report</button>
`
    : `<button class="btn danger deleteArtwork"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <!-- Lid -->
  <path d="M3 6h18" />
  <path d="M8 6l1-2h6l1 2" />
  <!-- Bin -->
  <rect x="5" y="6" width="14" height="14" rx="2" />
  <!-- Lines -->
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
  artworkMenu.hidden ^=1;
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
    description.textContent = artwork.description;
    artworkContent.appendChild(description);

    artworkItem.appendChild(artworkContent);

    // LIKE SECTION
    const likeContainer = document.createElement("div");
    likeContainer.classList.add("likeContainer");
    
    const likeBtn = document.createElement("button");
    likeBtn.classList.add("likeBtn", "icon-btn");

    const likeIcon = document.createElement("span");
    likeIcon.textContent = artwork.is_liked ? "♥" : "♡";
artwork.is_liked ? likeIcon.classList.add("liked") : "";

    const likeCount = document.createElement("span");
    likeCount.classList.add("likeCount");
    likeCount.textContent = artwork.like_count || 0;

    likeBtn.appendChild(likeIcon);
    likeBtn.appendChild(likeCount);
    likeContainer.appendChild(likeBtn);

    artworkItem.append(likeContainer);

    // Append card to container
    container.prepend(artworkItem);
    
    await initShareButton(".shareArtworkBtn", "Check out this artwork", "Found an amizing masterpiece on CanvArt", `artwork/${artwork.id}`);

    magnifyImg(img);
    
    await handleArtworkLike({
      likeBtn,
      artworkId: artwork.id,
      likeCount,
      likeIcon,
    });

  };

}

export function magnifyImg(img) {
  img.addEventListener("click", () => {
    const rect = img.getBoundingClientRect();

    const overlay = document.createElement("div");
    overlay.classList.add("magnified-img-container");

    const clone = img.cloneNode(true);
    clone.classList.add("magnified-image");

    // start position = exact current render
    clone.style.position = "fixed";
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;

    overlay.appendChild(clone);
    document.body.appendChild(overlay);

    // force layout
    clone.getBoundingClientRect();

    // animate via class (NOT manual transform math)
    requestAnimationFrame(() => {
      clone.classList.add("open");
    });

    // close
    overlay.addEventListener("click", () => {
      clone.classList.remove("open");

      setTimeout(() => overlay.remove(), 300);
    });
  });
}