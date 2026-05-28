import { handleSidebarToggle } from "./utils/sidebar/toggle.js";
import { attachSignoutEvents } from "./auth/login.js";
import { initSession } from "./session.js";
import { handleBackBtn } from "./utils/button.js";
import { loadComponent } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { loadSidebarUser } from "./user.js";

document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname;

  //1. Load correct sidebar based on page
  if (path.includes("profile")) {
    await loadComponent(
      "https://loghue.com/components/folder-sidebar",
      "sidebar",
    );
  }
  
  // 2. Load sidebar HTML
  await loadComponent(
    "https://joincanvart.vercel.app/components/sidebar",
    "sidebar",
  );

  // 3. Initialize session FIRST
  await initSession();

  // 4. Now load the sidebar user (sessionState.user is ready)
  await loadSidebarUser();

  // 5. Attach UI logic
  handleSidebarToggle();
  handleBackBtn();
  attachSignoutEvents();
});

