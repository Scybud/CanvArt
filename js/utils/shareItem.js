import { toastMsg } from "../components/toast.js";

export function initShareButton(btn, title, description, url) {
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const shareData = {
      title,
      text: description,
      url,
    };

    // Native share
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
      await navigator.clipboard.writeText(url);
      await toastMsg("Copied to clipboard", "success");
    } catch (err) {
      window.prompt("Copy this link:", url);
    }
  });
}
