import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";

// GET ALL ARTWORKS
export async function fetchAllCollections() {
  const { data, error } = await supabase.from("collections").select(`
      *,
      profiles (
        id, username, name, avatar_url
      )
    `);

  if (error) {
    toastMsg("Error loading collections", "error");
    console.log(error);
    return [];
  }

  return data;
}

export async function fetchCollectionById(collectionId) {
  const { data, error } = await supabase
    .from("collections")
    .select(
      `
      *,
      profiles (
        id,
        username,
        name,
        avatar_url
      ),
      collection_artworks (
        *,
        artworks (
          *,
          profiles (
            id,
            username,
            name,
            avatar_url
          )
        )
      )
    `,
    )
    .eq("id", collectionId)
    .single();

  if (error) {
    toastMsg("Error loading collection", "error");
    console.log(error);
    return null;
  }

  return data;
}

// GET ARTWORKS BY USER
export async function fetchCollectionsByUserId(userId) {
  const { data, error } = await supabase
    .from("collections")
    .select(
      `
      *,
      profiles (
        id, username, name, avatar_url
      )
    `,
    )
    .eq("user_id", userId);

  if (error) {
    toastMsg("Error loading collections", "error");
    console.log(error);
    return [];
  }

  return data;
}
