import { enrichArtworksWithLikes } from "./artworkLikes.js";
import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";


// GET ALL ARTWORKS
export async function fetchAllArtworks() {
  const { data, error } = await supabase.from("artworks").select(`
      *,
      profiles (
        id, username, name, avatar_url
      )
    `);

  if (error) {
    toastMsg("Error loading artworks", "error");
    console.log(error);
    return [];
  }

  return data;
}
    
// data/artworks.js
export async function fetchArtworks({ page = 1, limit = 12 } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

    const { data, error } = await supabase
      .from("artworks")
      .select(
        `
      *,
      profiles (
        id, username, name, avatar_url
      ),
            collection_artworks(count)
    `,
      )
      .order("created_at", { ascending: false })
      .range(from, to);

  if (error) throw error;
  return data || [];
}

export async function fetchArtworksByUserId(viewerId, profileUserId) {
  const { data, error } = await supabase
    .from("artworks")
    .select(
      `
      *,
      profiles (
        id, username, name, avatar_url
      )
    `,
    )
    .eq("user_id", profileUserId);

  if (error) {
    toastMsg("Error loading artworks", "error");
    console.log(error);
    return [];
  }

  return await enrichArtworksWithLikes(data, viewerId);
}
