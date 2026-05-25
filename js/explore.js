import {loadComponent} from "https://scybud.github.io/scybud-ui/js/utils/modal.js"

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

    uploadArtwork.forEach((btn) => {

        btn.addEventListener("click", async () => {
            await loadComponent(
                "../components/modals/create/upload-artwork.html",
                "modalContainer",
            );
        })
    })
}