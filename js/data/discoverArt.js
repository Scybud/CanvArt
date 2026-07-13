const AIC_API = "https://api.artic.edu/api/v1/artworks/search";
const AIC_IIIF_BASE = "https://www.artic.edu/iiif/2";

export async function fetchDiscoverArtworks(page = 1, limit = 20) {
  const params = new URLSearchParams({
    q: "*",
    "query[term][is_public_domain]": "true",
    fields: "id,title,artist_display,image_id,date_display",
    page: String(page),
    limit: String(limit),
  });

  const res = await fetch(`${AIC_API}?${params}`);
  if (!res.ok) throw new Error(`AIC API error: ${res.status}`);

  const { data, pagination } = await res.json();

  const artworks = data
    .filter((art) => art.image_id) // skip works with no image
    .map((art) => ({
      id: `aic-${art.id}`,
      title: art.title,
      artist: art.artist_display || "Unknown artist",
      date: art.date_display,
      imageUrl: `${AIC_IIIF_BASE}/${art.image_id}/full/843,/0/default.jpg`,
      sourceUrl: `https://www.artic.edu/artworks/${art.id}`,
    }));

  return {
    artworks,
    currentPage: pagination.current_page,
    totalPages: pagination.total_pages,
  };
}
