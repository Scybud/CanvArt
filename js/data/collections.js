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
