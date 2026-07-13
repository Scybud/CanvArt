import { fetchDiscoverArtworks } from "./data/discoverArt.js";
import { createDiscoverCard } from "./components/discoverCard.js";

const state = {
  page: 0,
  totalPages: Infinity,
  loading: false,
};

let sentinel = null;
let observer = null;

async function initExplore() {
  await loadNextPage();
  setupInfiniteScroll();
}

async function loadNextPage() {
  const container = document.getElementById("discoverArt");
  if (!container || state.loading || state.page >= state.totalPages) return;

  state.loading = true;
  const nextPage = state.page + 1;

  // First load: clear the static skeleton markup from the HTML.
  if (state.page === 0) {
    container.innerHTML = "";
  } else {
    showLoadingMore(container);
  }

  try {
    const { artworks, currentPage, totalPages } = await fetchDiscoverArtworks(
      nextPage,
      20,
    );

    hideLoadingMore(container);

    if (artworks.length === 0 && state.page === 0) {
      container.innerHTML = "<p>No artworks to show right now.</p>";
      return;
    }

    createDiscoverCard(container, artworks);

    state.page = currentPage;
    state.totalPages = totalPages;

    if (state.page >= state.totalPages) {
      showEndOfResults(container);
      if (observer && sentinel) observer.unobserve(sentinel);
    }
  } catch (err) {
    console.error("Discover art failed to load:", err);
    hideLoadingMore(container);
    if (state.page === 0) {
      container.innerHTML =
        "<p>Couldn't load artworks right now. Try refreshing.</p>";
    } else {
      showRetry(container);
    }
  } finally {
    state.loading = false;
  }
}

function setupInfiniteScroll() {
  const anchor = document.getElementById("mainContentInner") || document.body;

  sentinel = document.createElement("div");
  sentinel.id = "discoverSentinel";
  sentinel.style.height = "1px";
  anchor.appendChild(sentinel);

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadNextPage();
      }
    },
    { rootMargin: "100px" }, // start fetching before the user hits the true bottom
  );

  observer.observe(sentinel);
}

function showLoadingMore(container) {
  let loader = document.getElementById("discoverLoadingMore");
  if (loader) {
    loader.hidden = false;
    return;
  }
  loader = document.createElement("div");
  loader.id = "discoverLoadingMore";
  loader.className = "discoverLoadingMore";
  loader.textContent = "Loading more artworks…";
  container.after(loader);
}

function hideLoadingMore() {
  const loader = document.getElementById("discoverLoadingMore");
  if (loader) loader.hidden = true;
}

function showEndOfResults(container) {
  const end = document.createElement("p");
  end.className = "discoverEnd";
  end.textContent = "You've reached the end of the collection.";
  container.after(end);
}

function showRetry(container) {
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "btn discoverRetry";
  retry.textContent = "Couldn't load more — retry";
  retry.addEventListener("click", () => {
    retry.remove();
    loadNextPage();
  });
  container.after(retry);
}

initExplore();
