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