import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";

export async function fetchAllArtists() {
  const { data: artists, error } = await supabase
  .from("profiles")
  .select("*");

  if(error) {
    toastMsg("Error loading artists", "error")
    console.log("error");
    return
  }

  return artists;
}

export async function fetchArtistProfile(artistUsername) {
  const { data: artists, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", artistUsername)
    .maybeSingle();

  if (error) {
    toastMsg("Error loading artists", "error");
    console.log("error");
    return;
  }

  return artists;
}

export async function fetchFeaturedArtists(limit) {
      const { data: featuredArtists, error } = await supabase
        .from("profiles")
        .select("name, username, avatar_url")
        .eq("featured", true)
        .limit(limit);

      if (error) {
        toastMsg("Error loading artists", "error");
        console.log("error");
        return
      }

      return featuredArtists;
}
