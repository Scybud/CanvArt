export function linkify(text) {
  const urlRegex = /((https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?)/g;

  return text.replace(urlRegex, (url) => {
    const href = url.startsWith("http") ? url : `https://${url}`;

    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}
