import { sessionState } from "../session.js";
import { supabase } from "../supabase.js";
import {
  loadComponent,
  closeModal,
} from "https://scybud.github.io/scybud-ui/js/utils/modal.js";

export function setButtonLoading(button, isLoading) {
  if (!button) return;

  if (isLoading) {
    button.classList.add("loading");
    button.setAttribute("aria-busy", "true");
    if (
      button instanceof HTMLButtonElement ||
      button instanceof HTMLInputElement
    ) {
      button.disabled = true;
    } else {
      button.style.pointerEvents = "none";
    }
    return;
  }

  button.classList.remove("loading");
  button.removeAttribute("aria-busy");
  if (
    button instanceof HTMLButtonElement ||
    button instanceof HTMLInputElement
  ) {
    button.disabled = false;
  } else {
    button.style.pointerEvents = "";
  }
}

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
    if (!user) {
      await loadComponent(
        "/components/modals/request-auth",
        "modalContainer",
      );
      return;
    }

    const { data: existing } = await supabase
      .from("artwork_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (existing) {
      await supabase.from("artwork_likes").delete().eq("id", existing.id);

      // Remove the liked class for the SVG outline state
      likeIcon.classList.remove("liked");
      likeCount.textContent = parseInt(likeCount.textContent) - 1;
    } else {
      // Add the liked class to trigger the filled SVG state
      likeIcon.classList.add("liked");
      likeCount.textContent = parseInt(likeCount.textContent) + 1;

      
      await supabase.from("artwork_likes").insert({
        user_id: user.id,
        artwork_id: artworkId,
      });

    }
  });
}