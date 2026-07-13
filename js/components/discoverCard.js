export function createDiscoverCard(container, artworks) {
  artworks.forEach((art) => {
    const card = document.createElement("a");
    card.href = art.sourceUrl;
    card.target = "_blank";
    card.rel = "noopener";
    card.classList.add("discoverCard");
    card.setAttribute(
      "aria-label",
      `${art.title}, ${art.artist}. View on Art Institute of Chicago.`,
    );

    card.innerHTML = `
      <img
        src="${art.imageUrl || "assets/images/default.png"}"
        alt="${art.title}"
        loading="lazy"
        onerror="this.onerror=null; this.src='assets/images/default.png';"
      >
      <div class="discoverPlaque">
        <span class="plaqueLabel">Art Institute of Chicago</span>
        <p class="plaqueTitle">${art.title}</p>
        <p class="plaqueMeta">${art.artist}${art.date ? ` · ${art.date}` : ""}</p>
      </div>
    `;

    container.appendChild(card);
  });
}
