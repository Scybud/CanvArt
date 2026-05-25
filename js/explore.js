import {loadComponent} from "https://scybud.github.io/scybud-ui/js/utils/modal.js"
import { sessionState } from "./session.js";

async function initExplore() {
    
    await handleArtworkUpload()
}

async function handleArtworkUpload() {


    const showArtistsListModalBtn = document.getElementById("showArtistsListModal");
    if(showArtistsListModalBtn) {

    showArtistsListModalBtn.addEventListener("click", async () => {

       await loadComponent(
         "../components/modals/artists-list.html",
         "modalContainer",
       );
    });
}

const uploadArtwork = document.querySelectorAll(".upload-artwork");
if(uploadArtwork) {

    uploadArtwork.forEach(async(btn) => {

        
        btn.addEventListener("click", async () => {
            if (!sessionState.user)  {
      await loadComponent(
        "../components/modals/request-auth.html",
        "modalContainer",
      );
    
      return;
    }  
            await loadComponent(
                "../components/modals/create/upload-artwork.html",
                "modalContainer",
            );
        })
    })
}
}

initExplore();