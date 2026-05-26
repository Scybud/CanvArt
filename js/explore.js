import {loadComponent, closeModal} from "https://scybud.github.io/scybud-ui/js/utils/modal.js"
import { sessionState } from "./session.js";
import { uploadArtwork } from "./uploadArtwork.js";
import { fetchArtworks } from "./data/artworks.js";
import { createArtworkCard } from "./components/artworkCard.js";


async function initExplore() {
    
    await handleArtworkUpload();

    const artworksData = await fetchArtworks();

    const exploreContainer = document.getElementById("explore");
    createArtworkCard(exploreContainer, artworksData)
}

async function handleArtworkUpload() {


    const showArtistsListModalBtn = document.getElementById("showArtistsListModal");
    if(showArtistsListModalBtn) {

    showArtistsListModalBtn.addEventListener("click", async () => {

       await loadComponent(
         "./components/modals/artists-list.html",
         "modalContainer",
       );
    });
}

const uploadArtworkBtns = document.querySelectorAll(".upload-artwork");
if (uploadArtworkBtns) {
  uploadArtworkBtns.forEach(async (btn) => {
    btn.addEventListener("click", async () => {
      if (!sessionState.user) {
        await loadComponent(
          "./components/modals/request-auth.html",
          "modalContainer",
        );

        return;
      }
      await loadComponent(
        "./components/modals/create/upload-artwork.html",
        "modalContainer",
      );
      await uploadArtwork(
        "artworkInput",
        "imagePreview",
        "artworkTitle",
        "artworkDescription",
        "uploadArtworkBtn",
      );
    });
  });
}
}

initExplore();