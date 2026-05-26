import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";

export async function fetchArtworks() {
  const { data: artworks, artworksError } = await supabase.from("artworks")
    .select(`
        *,
        profiles (
            id, username, name, avatar_url
            )
            `);

  if (artworksError) {
    toastMsg("Error loading artworks");
    console.log(artworksError);
    return;
  }

  return artworks;
}
                    