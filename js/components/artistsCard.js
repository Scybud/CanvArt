export function createArtistCard(container, artists) {

  container.innerHTML = "";

  artists.forEach((artist) => {
    const artistItem = document.createElement("a");
    artistItem.href = `/profile/${artist.username}`;
    artistItem.classList.add("artist-card");

    const artworks = artist.artworks || [];
    const safeArtworks = artworks.slice(0, 3);

    // ---------------------------
    // PREVIEW GRID (always 3 slots)
    // ---------------------------
    const previewGrid = document.createElement("div");
    previewGrid.classList.add("artist-preview-grid");

    for (let i = 0; i < 3; i++) {
      const img = document.createElement("img");

      if (safeArtworks[i]) {
        img.src = safeArtworks[i].artwork_url;
        img.alt = safeArtworks[i].title || artist.name;
        img.loading = "lazy"
      } else {
        img.src = "../../assets/images/no-artwork.png";
        img.alt = "No artwork";
        img.classList.add("empty-artwork");
                img.loading = "lazy";
      }

      previewGrid.appendChild(img);
    }

    // ---------------------------
    // CONTENT
    // ---------------------------
    const content = document.createElement("div");
    content.classList.add("artist-card-content");

    const avatar = document.createElement("img");
    avatar.classList.add("artist-avatar");
    avatar.src = artist.avatar_url || "../../assets/images/default-avatar.png";
    avatar.alt = artist.name;
        avatar.loading = "lazy";

    const info = document.createElement("div");
    info.classList.add("artist-info");

    const name = document.createElement("span");
    name.classList.add("artist-name");
    name.textContent = artist.name;

    const username = document.createElement("span");
    username.classList.add("artist-username");
    username.textContent = `@${artist.username}`;

    const bio = document.createElement("p");
    bio.classList.add("artist-bio");
    bio.textContent = artist.bio || "No bio available";

    const stats = document.createElement("div");
    stats.classList.add("artist-stats");

    const artworkCount = document.createElement("span");
    artworkCount.textContent = `${artworks.length} artworks`;

    const collectionCount = document.createElement("span");
    collectionCount.textContent = `${artist.collections.length || 0} collections`;

    info.appendChild(name);
    info.appendChild(username);
    info.appendChild(bio);
    info.appendChild(stats);

    stats.appendChild(artworkCount);
    stats.appendChild(collectionCount);

    content.appendChild(avatar);
    content.appendChild(info);

    artistItem.appendChild(previewGrid);
    artistItem.appendChild(content);

    container.appendChild(artistItem);
  });
}
