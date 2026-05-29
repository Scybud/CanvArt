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
