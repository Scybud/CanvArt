import { supabase } from "./supabase.js";

export const sessionState = {
  user: null,
  profile: null,
};

let resolveSessionReady;

export const sessionReady = new Promise((resolve) => {
  resolveSessionReady = resolve;
});

export async function initSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    resolveSessionReady();
    return;
  }

  const user = session?.user || null;

  if (!user) {
    resolveSessionReady();
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Profile error:", profileError);
    resolveSessionReady();
    return;
  }

  sessionState.user = user;
  sessionState.profile = profile;

  resolveSessionReady();

  handleUi();
}

function handleUi() {
  const profileImg = document.querySelector(".profileImg");
  const name = document.querySelector(".name")
  const userName = document.getElementById("userName");

  if (!sessionState.user || !sessionState.profile) return;

  const heroBanner = document.querySelector(".hero-banner");
  if(heroBanner) heroBanner.remove();

  const email = sessionState.user.email;
  const [local, domain] = email.split("@");
  const shortEmail = `${local.slice(0, 9)}...@${domain}`;


  if (userName) {
    userName.textContent = sessionState.profile.name
  }

  const avatarUrl =
    sessionState.profile?.avatar_url;

  if (profileImg) {
    profileImg.src = avatarUrl;
    profileImg.className = "profileImg";
  }

}

initSession();
