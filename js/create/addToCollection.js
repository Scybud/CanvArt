import { supabase } from "../supabase.js";
import { sessionState } from "../session.js";
import {
  loadComponent,
  closeModal,
} from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { toastMsg } from "../components/toast.js";

let selectedCollectionId = null;

export async function initAddToCollectionModal(artworkId) {
  const carousel = document.getElementById("artworkCarousel");
  const confirmBtn = document.getElementById("confirmAddToCollectionBtn");

  // 1. Fetch collections owned by the user
  const { data: collections, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", sessionState.user.id);

  if (error) {
    console.error("Error loading collections:", error);
    toastMsg("Could not load collections", "error");
    return;
  }

  // 2. Render collections into carousel
  collections.forEach((coll) => {
    const item = document.createElement("div");
    item.className = "carousel-item";
    item.dataset.collectionId = coll.id;

    item.innerHTML = `
      <img src="${coll.thumbnail_url}" class="carousel-image" alt="${coll.name}">
      <p class="carousel-label">${coll.name}</p>
    `;

    item.addEventListener("click", () => {
      document.querySelectorAll(".carousel-item").forEach((el) => {
        el.classList.remove("selected");
      });

      item.classList.add("selected");
      selectedCollectionId = coll.id;
      confirmBtn.disabled = false;
    });

    carousel.appendChild(item);
  });

  // 3. Confirm button
  confirmBtn.addEventListener("click", async () => {
    if (!selectedCollectionId) return;

const { error } = await supabase
  .from("collection_artworks")
  .upsert(
    { collection_id: selectedCollectionId, artwork_id: artworkId },
    { onConflict: "collection_id,artwork_id" },
  );


if (error) {
  if (error.code === "23505") {
    toastMsg("Artwork already exists in this collection", "error");
    return;
  }

  console.log(error)
  toastMsg("Failed to add artwork to collection", "error");
  return;
}

    toastMsg("Artwork added to collection", "success");
    closeModal();
  });
}
