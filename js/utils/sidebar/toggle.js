const toggleSidebar = document.getElementById("toggleSidebar");
const sidebar = document.querySelector(".sidebar");

export function handleSidebarToggle() {
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}
