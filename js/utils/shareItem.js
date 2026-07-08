import { toastMsg } from "../components/toast.js";

export function initShareButton(btn, title, description, url, imageUrl) {
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const shareData = {
      title,
      text: description,
      url,
    };

    // Try to attach an image file if one is provided
    if (imageUrl) {
      try {
        const file = await urlToFile(imageUrl);
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      } catch (err) {
        // Silently skip image if it fails to load/convert
      }
    }

    // Native share
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          await toastMsg("Failed to share", "error");
        }
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

async function urlToFile(imageUrl) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const filename = imageUrl.split("/").pop().split("?")[0] || "image.png";
  return new File([blob], filename, { type: blob.type });
}
