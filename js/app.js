import { handleSidebarToggle } from "./utils/sidebar/toggle.js";
import { attachSignoutEvents } from "./auth/login.js";
import { initSession } from "./session.js";

document.addEventListener("DOMContentLoaded", () => {
  handleSidebarToggle();

  attachSignoutEvents();
  initSession();
});
