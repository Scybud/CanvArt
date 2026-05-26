import { handleSidebarToggle } from "./utils/sidebar/toggle.js";
import { attachSignoutEvents } from "./auth/login.js";
import { initSession } from "./session.js";
import { handleBackBtn } from "./utils/button.js";
import { loadComponent } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";

document.addEventListener("DOMContentLoaded", async () => {

  await loadComponent("./components/sidebar.html", "sidebar");

  handleSidebarToggle();
handleBackBtn();

  attachSignoutEvents();
  initSession();
});
