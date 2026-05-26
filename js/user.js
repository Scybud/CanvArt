import { supabase } from "./supabase.js";
import { sessionState } from "./session.js"; // wherever you store it

export async function loadSidebarUser() {
  const nameEl = document.getElementById("sidebarName");
  const usernameEl = document.getElementById("sidebarUsername");
  const avatarEl = document.getElementById("sidebarAvatar");

  // If no user logged in
  if (!sessionState.user) {
    nameEl.textContent = "Guest";
    usernameEl.textContent = "";
    return;
  }

  // Fetch profile from DB
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name, username, avatar_url")
    .eq("id", sessionState.user.id)
    .single();

  if (error || !profile) return;

  // Update UI
  nameEl.textContent = profile.name;
  usernameEl.textContent = "@" + profile.username;
  usernameEl.href = `/profile/${profile.username}`;

  if (profile.avatar_url) {
    avatarEl.src = profile.avatar_url;
  }
}
