import { handleArtworkLike } from "../utils/button.js";

export async function createArtworkCard(container, artworks) {
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
    imgContainer.appendChild(img);
    img.loading = "lazy";

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