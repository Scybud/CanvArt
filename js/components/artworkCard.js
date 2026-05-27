export function createArtworkCard(container, artworks) {
  artworks.forEach((artwork) => {
    const artworkItem = document.createElement("div");
    artworkItem.classList.add("artworkItem", "card");

    // -----------------------------
    // IMAGE CONTAINER
    // -----------------------------
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("imgContainer");
    artworkItem.appendChild(imgContainer);

    const img = document.createElement("img");
    img.classList.add("artwork")
    img.src = artwork.artwork_url; // FIXED
    img.alt = artwork.description || "Artwork";
    imgContainer.appendChild(img);

    // -----------------------------
    // OWNER INFO (inside image)
    // -----------------------------
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
    ownerUsername.href = `/profile.html/${artwork.profiles.username}`;
    ownerText.appendChild(ownerUsername);

    ownerInfo.appendChild(ownerText);
    imgContainer.appendChild(ownerInfo);

    // ARTWORK CONTENT
    const artworkContent = document.createElement("div");
    artworkContent.classList.add("artworkContent");

    const title = document.createElement("span");
    title.classList.add("text-bold")
    title.textContent = artwork.title;
    artworkContent.appendChild(title);

    const description = document.createElement("p");
    description.textContent = artwork.description;
    artworkContent.appendChild(description);

    artworkItem.appendChild(artworkContent);

    // Append card to container
    container.prepend(artworkItem);
  });
}
