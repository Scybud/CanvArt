import { toastMsg } from "../components/toast.js";

export async function initShareButton(btnClass, title, description, url) {
  const buttons = document.querySelectorAll(btnClass);

  if (!buttons || buttons.length === 0) return;


  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const shareData = {
        title,
        text: description,
        url,
      };

      // Native share if supported
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          await toastMsg("Failed to share", "error");
        }
        return;
      }

      // Clipboard fallback
      try {
        await navigator.clipboard.writeText(shareData.url);
        await toastMsg("Copied to clipboard", "success");
      } catch (err) {
        window.prompt("Copy this link:", shareData.url);
      }
    });
  });
}
