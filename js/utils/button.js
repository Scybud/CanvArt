import { sessionState } from "../session.js";
import { supabase } from "../supabase.js";

export function handleBackBtn() {
  const backBtn = document.querySelectorAll(".backBtn");
  backBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.history.back();
    });
  });
}

export function handleArtworkLike({ likeBtn, artworkId, likeCount, likeIcon }) {
  likeBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = await sessionState.user;
    if (!user) return;

    const { data: existing } = await supabase
      .from("artwork_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (existing) {
      await supabase.from("artwork_likes").delete().eq("id", existing.id);

      likeIcon.textContent = "♡";
      likeCount.textContent = parseInt(likeCount.textContent) - 1;
    } else {
      await supabase.from("artwork_likes").insert({
        user_id: user.id,
        artwork_id: artworkId,
      });

      likeIcon.textContent = "♥";
      likeCount.textContent = parseInt(likeCount.textContent) + 1;
    }
  });
}