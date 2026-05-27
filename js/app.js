import { handleSidebarToggle } from "./utils/sidebar/toggle.js";
import { attachSignoutEvents } from "./auth/login.js";
import { initSession } from "./session.js";
import { handleBackBtn } from "./utils/button.js";
import { loadComponent } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { loadSidebarUser } from "./user.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load sidebar HTML
  await loadComponent("./components/sidebar", "sidebar");

  // 2. Initialize session FIRST
  await initSession();

  // 3. Now load the sidebar user (sessionState.user is ready)
  await loadSidebarUser();

  // 4. Attach UI logic
  handleSidebarToggle();
  handleBackBtn();
  attachSignoutEvents();
});

