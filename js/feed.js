import { supabase } from "./supabase.js";
import { sessionReady, sessionState } from "./session.js";
import { fetchArtworks } from "./data/artworks.js";
import { enrichArtworksWithLikes } from "./data/artworkLikes.js";
import { handleArtworkLike } from "./utils/button.js";
import { initShareButton } from "./utils/shareItem.js";
import { toastMsg } from "./components/toast.js";
import { createCollection } from "./create/createCollection.js";
import {
  loadComponent,
  createEmptyState,
} from "https://scybud.github.io/scybud-ui/js/ui.js";
import {
  fetchCollectionsByUserId,
  fetchCollectionById,
} from "./data/collections.js";

const collectionId = new URLSearchParams(location.search).get("c");

const LIMIT = 10; // artworks per fetch
const KEEP = 2; // slides kept mounted on each side of the active one

const feed = document.getElementById("feed");
const sheet = document.getElementById("collectSheet");
const rows = document.getElementById("collectRows");

const slides = []; // { el, art, media, ph, img }
let user = null;
let page = 1;
let loading = false;
let hasMore = true;
let active = -1;

const ICONS = {
  like: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  collect: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/><path d="M12 7v6M9 10h6"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>`,
};

// Ask Cloudinary for a screen sized image instead of the original.
function optimizeUrl(url) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_1080/");
}

function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function actionBtn(icon, label, extraClass = "") {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `feedAct ${extraClass}`.trim();
  btn.setAttribute("aria-label", label);
  btn.innerHTML = `<span class="feedActIcon">${icon}</span>`;
  return btn;
}

function addSlide(art) {
  const profile = art.profiles || {};
  const el = document.createElement("section");
  el.className = "feedSlide";
  el.dataset.i = slides.length;

  el.innerHTML = `
    <div class="feedCard">
      <div class="feedMedia">
        <div class="feedPh"></div>
        <div class="feedMeta">
          <a class="feedArtist">
            <img class="feedAvatar" alt="" />
            <span class="feedArtistText">
              <span class="feedArtistName"></span>
              <span class="feedArtistUser"></span>
            </span>
          </a>
          <h2 class="feedTitle"></h2>
          <p class="feedDesc"></p>
        </div>
      </div>
      <div class="feedRail"></div>
    </div>`;

  // Fill user content with textContent so it stays safe.
  el.querySelector(".feedArtist").href = `/profile/${profile.username}`;
  el.querySelector(".feedAvatar").src =
    profile.avatar_url || "assets/images/default-avatar.png";
  el.querySelector(".feedArtistName").textContent = profile.name || "";
  el.querySelector(".feedArtistUser").textContent = profile.username
    ? `@${profile.username}`
    : "";
  el.querySelector(".feedTitle").textContent = art.title || "";
  el.querySelector(".feedDesc").textContent = art.description || "";

  // Like button uses the same markup as the artwork page.
  const likeBtn = actionBtn("", "Like", "likeBtn");
  const likeIcon = document.createElement("span");
  likeIcon.className = "likeIcon";
  likeIcon.innerHTML = ICONS.like;
  if (art.is_liked) likeIcon.classList.add("liked");
  const likeCount = document.createElement("span");
  likeCount.className = "likeCount";
  likeCount.textContent = art.like_count || 0;
  likeBtn.querySelector(".feedActIcon").append(likeIcon);
  likeBtn.append(likeCount);

  const collectBtn = actionBtn(ICONS.collect, "Add to collection");
  const shareBtn = actionBtn(ICONS.share, "Share", "shareArtworkBtn");

  el.querySelector(".feedRail").append(likeBtn, collectBtn, shareBtn);
  feed.append(el);

  const slide = {
    el,
    art,
    media: el.querySelector(".feedMedia"),
    ph: el.querySelector(".feedPh"),
    img: null,
  };
  slides.push(slide);
  observer.observe(el);

  // Wire existing like and share logic after the nodes are in the DOM.
  handleArtworkLike({ likeBtn, artworkId: art.id, likeCount, likeIcon });
  initShareButton(
    shareBtn,
    art.title,
    art.description,
    `${window.location.origin}/artwork/${art.id}`,
  );

  const collectionCount = document.createElement("span");
  collectBtn.addEventListener("click", () => openCollectSheet(art, collectionCount));
collectionCount.className = "collectionCount";
collectionCount.textContent = art.collection_artworks?.[0]?.count || 0;
collectBtn.append(collectionCount);


  // Double tap likes the artwork if it isn't liked yet.
  slide.media.addEventListener("dblclick", () => {
    if (!likeIcon.classList.contains("liked")) likeBtn.click();
    slide.media.insertAdjacentHTML(
      "beforeend",
      `<svg class="feedBurst" viewBox="0 0 24 24">${ICONS.like}</svg>`,
    );
    setTimeout(() => slide.media.querySelector(".feedBurst")?.remove(), 700);
  });
}

// Only slides near the active one keep an image in the DOM.
function mount(i) {
  const s = slides[i];
  if (!s || s.img) return;
  const img = new Image();
  img.alt = s.art.title || "Artwork";
  img.draggable = false;
  img.decoding = "async";
  img.onload = () => (s.ph.hidden = true);
  img.src = optimizeUrl(s.art.artwork_url);
  s.img = img;
  s.media.prepend(img);
}

function unmount(i) {
  const s = slides[i];
  if (!s || !s.img) return;
  s.img.remove();
  s.img = null;
  s.ph.hidden = false;
}

function setActive(i) {
  if (i === active) return;
  active = i;
  slides.forEach((_, j) => (Math.abs(j - i) <= KEEP ? mount(j) : unmount(j)));
  if (i >= slides.length - 3) loadMore();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) setActive(Number(e.target.dataset.i));
    });
  },
  { root: feed, threshold: 0.6 },
);

function showEnd() {
  if (!slides.length) {
    feed.innerHTML = `<p class="feedEmpty">No artworks to show right now.</p>`;
    return;
  }
  const end = document.createElement("section");
  end.className = "feedEnd";
const back = collectionId
  ? `/collection/${encodeURIComponent(collectionId)}`
  : "gallery";
const label = collectionId ? "Back to Collection" : "Back to Gallery";
end.innerHTML = `<p>You are all caught up.</p><a href="${back}" class="btn btn-primary">${label}</a>`;  feed.append(end);
}

// Collection mode: load every artwork once, in collection order.
async function loadCollection() {
  loading = true;
  hasMore = false;
  try {
    const collection = await fetchCollectionById(collectionId);
    const arts = (collection?.collection_artworks || [])
      .map((item) => item.artworks)
      .filter(Boolean);
    const enriched = await enrichArtworksWithLikes(arts, user?.id);
    enriched.forEach(addSlide);
  } catch (err) {
    console.error("Collection feed failed to load:", err);
    toastMsg("Couldn't load collection", "error");
  } finally {
    loading = false;
    showEnd();
  }
}

async function loadMore() {
  if (loading || !hasMore) return;
  if (collectionId) return loadCollection();
  loading = true;

  try {
    const batch = await fetchArtworks({ page, limit: LIMIT });

    if (!batch || batch.length === 0) {
      hasMore = false;
      showEnd();
      return;
    }

    const enriched = await enrichArtworksWithLikes(batch, user?.id);
    shuffle(enriched).forEach(addSlide);
    page += 1;

    if (batch.length < LIMIT) {
      hasMore = false;
      showEnd();
    }
  } catch (err) {
    console.error("Feed failed to load:", err);
    toastMsg("Couldn't load artworks", "error");
  } finally {
    loading = false;
  }
}

// ADD TO COLLECTION SHEET
async function openCollectSheet(art, countEl) {
  if (!user) {
    await loadComponent("/components/modals/request-auth", "modalContainer");
    return;
  }

  sheet.hidden = false;
  rows.textContent = "Loading...";

  const [collections, linkRes] = await Promise.all([
    fetchCollectionsByUserId(user.id),
    supabase
      .from("collection_artworks")
      .select("collection_id")
      .eq("artwork_id", art.id),
  ]);

  const inSet = new Set((linkRes.data || []).map((l) => l.collection_id));

  if (!collections || collections.length === 0) {
    rows.innerHTML = "";
    await createEmptyState({
      container: rows,
      icon: "📒",
      title: "Nothing here yet",
      description: "You have no collections yet",
      actionText: "Create Collection",
      onAction: async () => {
        closeSheet();
        await loadComponent(
          "/components/modals/create/create-collection",
          "modalContainer",
        );
        await createCollection(
          "collectionThumbnailInput",
          "imagePreview",
          "collectionName",
          "collectionDescription",
          "createCollectionBtn",
        );
      },
    });
    return;
  }

  rows.innerHTML = "";
  collections.forEach((c) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "feedRow";
    const name = document.createElement("strong");
    name.textContent = c.name;
    const state = document.createElement("span");
    row.append(name, state);

    const paint = () => {
      row.classList.toggle("in", inSet.has(c.id));
      state.textContent = inSet.has(c.id) ? "Added" : "Add";
    };
    paint();

    row.addEventListener("click", async () => {
      if (row.disabled) return;
      row.disabled = true;

      const had = inSet.has(c.id);
      const { data, error } = had
        ? await supabase
            .from("collection_artworks")
            .delete()
            .eq("collection_id", c.id)
            .eq("artwork_id", art.id)
            .select()
        : await supabase
            .from("collection_artworks")
            .upsert(
              { collection_id: c.id, artwork_id: art.id },
              { onConflict: "collection_id,artwork_id" },
            );

      row.disabled = false;

      // A blocked delete returns no error, so check that a row was removed.
      if (error || (had && !data?.length)) {
        console.error(error);
        toastMsg("Couldn't update collection", "error");
        return;
      }
      had ? inSet.delete(c.id) : inSet.add(c.id);
      paint();
      countEl.textContent = Number(countEl.textContent) + (had ? -1 : 1);

      toastMsg(
        had ? `Removed from ${c.name}` : `Added to ${c.name}`,
        "success",
      );
    });

    rows.append(row);
  });
}

function closeSheet() {
  sheet.hidden = true;
}

sheet.addEventListener("click", (e) => {
  if (e.target === sheet) closeSheet();
});

// NAVIGATION
const step = (dir) =>
  feed.scrollBy({ top: dir * feed.clientHeight, behavior: "smooth" });

document.getElementById("feedUp").addEventListener("click", () => step(-1));
document.getElementById("feedDown").addEventListener("click", () => step(1));

// Wheel paging: one gesture moves exactly one artwork.
let wheelLocked = false;
let lockUntil = 0;
let lockTimer;

function unlockSoon() {
  clearTimeout(lockTimer);
  const wait = Math.max(150, lockUntil - performance.now());
  lockTimer = setTimeout(() => (wheelLocked = false), wait);
}

feed.addEventListener(
  "wheel",
  (e) => {
    if (!sheet.hidden) return;
    e.preventDefault();
    // Trackpad inertia keeps firing, so each event extends the lock.
    if (wheelLocked) return unlockSoon();
    if (Math.abs(e.deltaY) < 10) return;
    wheelLocked = true;
    lockUntil = performance.now() + 600;
    step(e.deltaY > 0 ? 1 : -1);
    unlockSoon();
  },
  { passive: false },
);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSheet();
  if (!sheet.hidden) return;
  if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (["ArrowDown", "j"].includes(e.key)) {
    e.preventDefault();
    step(1);
  }
  if (["ArrowUp", "k"].includes(e.key)) {
    e.preventDefault();
    step(-1);
  }
});

async function initFeed() {
  await sessionReady;
  user = sessionState.user;
  await loadMore();
  if (slides.length) setActive(0);
}

initFeed();
