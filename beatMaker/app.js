import { supabase } from "../js/supabase.js";

// DOM Elements
const promptInput = document.getElementById("bm-prompt");
const modelSelect = document.getElementById("bm-model");
const generateBtn = document.getElementById("bm-generate-btn");
const statusDiv = document.getElementById("bm-status");
const quickTags = document.querySelectorAll(".bm-tag");

// Audio Player Elements
const audioElement = document.getElementById("bm-audio");
const playerEmpty = document.getElementById("bm-player-empty");
const playerLoaded = document.getElementById("bm-player-loaded");
const playerName = document.getElementById("bm-player-name");
const playerMeta = document.getElementById("bm-player-meta");
const playBtn = document.getElementById("bm-play-btn");
const playIcon = document.getElementById("bm-play-icon");
const downloadBtn = document.getElementById("bm-dl-btn");
const timeline = document.getElementById("bm-timeline");
const currentTimeDisplay = document.getElementById("bm-current");
const durationDisplay = document.getElementById("bm-duration");
const historyList = document.getElementById("bm-history-list");

// Global State
let currentBlobUrl = null;
const beatsHistory = [];

// --- UTILITIES & TRANSFORMS ---
function formatTime(secs) {
  if (isNaN(secs)) return "0:00";
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// --- CORE GENERATION ---
async function handleGenerate() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        statusDiv.textContent = "Please sign in to CanvArt to generate beats.";
        return;
      }

  const prompt = promptInput.value.trim();
  const model = modelSelect.value;

  if (!prompt) {
    statusDiv.textContent = "Please enter a description or select a tag first.";
    return;
  }

  // Update loading state
  generateBtn.disabled = true;
  statusDiv.innerHTML = `<i class="ti ti-loader-2" style="animation: spin 1s linear infinite;"></i> Composing your beat...`;
  generateBtn.innerHTML = `<i class="ti ti-loader-2" style="animation: spin 1s linear infinite;"></i> Generating...`;

  try {
    // Invoke Edge Function with explicit blob parsing configuration
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data, error } = await supabase.functions.invoke("beat-maker", {
    body: { prompt, model },
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });


    if (error) throw error;
    if (!data) throw new Error("No audio data returned from the server.");

    // Clear old blob URLs to prevent memory leaks
    if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);

    // Create stable local URL pointing directly to the response Blob
    currentBlobUrl = URL.createObjectURL(data);

    // Save to locally scoped history stack
    const newBeat = {
      prompt,
      model,
      url: currentBlobUrl,
      blob: data,
      id: Date.now(),
    };
    beatsHistory.unshift(newBeat);

    // Render interactive interface states
    loadAudioTrack(newBeat);
    updateHistoryUI();
    statusDiv.textContent = "Beat generated successfully!";
  } catch (err) {
    console.error("Generation failed:", err);
    statusDiv.textContent = "Error generating beat. Please try again.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `<i class="ti ti-wand" aria-hidden="true"></i> Generate beat`;
  }
}

// --- PLAYER CONTROLS ---
function loadAudioTrack(beat) {
  audioElement.src = beat.url;
  playerName.textContent = beat.prompt;
  playerMeta.textContent = `musicgen-${beat.model}`;

  // Swap layout visibility states
  playerEmpty.style.display = "none";
  playerLoaded.style.display = "block";

  // Auto-play the fresh track
  audioElement
    .play()
    .then(() => updatePlayIcon(true))
    .catch((e) =>
      console.log("Playback blocked by browser autoplay policy:", e),
    );

  // Bind file downloading attachment
  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = beat.url;
    a.download = `${beat.prompt.substring(0, 20).replace(/\s+/g, "_")}.flac`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
}

function updatePlayIcon(isPlaying) {
  if (isPlaying) {
    playIcon.className = "ti ti-player-pause";
  } else {
    playIcon.className = "ti ti-player-play";
  }
}

// --- EVENT LISTENERS ---

// Trigger core pipeline on interaction
generateBtn.addEventListener("click", handleGenerate);

// Click tags to quickly fill textarea
quickTags.forEach((tag) => {
  tag.addEventListener("click", () => {
    promptInput.value = tag.getAttribute("data-prompt");
    statusDiv.textContent = "";
  });
});

// Audio playback toggle execution
playBtn.addEventListener("click", () => {
  if (audioElement.paused) {
    audioElement.play();
    updatePlayIcon(true);
  } else {
    audioElement.pause();
    updatePlayIcon(false);
  }
});

// Sync progress indicators via native standard event lifecycles
audioElement.addEventListener("timeupdate", () => {
  if (!audioElement.duration) return;
  const progress = (audioElement.currentTime / audioElement.duration) * 100;
  timeline.value = progress;
  currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
});

audioElement.addEventListener("loadedmetadata", () => {
  durationDisplay.textContent = formatTime(audioElement.duration);
  timeline.value = 0;
});

audioElement.addEventListener("ended", () => {
  updatePlayIcon(false);
  timeline.value = 0;
  currentTimeDisplay.textContent = "0:00";
});

// Scrubbing timeline
timeline.addEventListener("input", () => {
  if (!audioElement.duration) return;
  const targetTime = (timeline.value / 100) * audioElement.duration;
  audioElement.currentTime = targetTime;
});

// --- UI UPDATES ---
function updateHistoryUI() {
  if (beatsHistory.length === 0) {
    historyList.innerHTML = `<li class="bm-history-empty">No beats generated yet</li>`;
    return;
  }

  historyList.innerHTML = beatsHistory
    .map(
      (beat) => `
    <li class="bm-history-item" data-id="${beat.id}">
      <div class="bm-history-item-left">
        <i class="ti ti-music"></i>
        <div class="bm-history-item-info">
          <p class="bm-history-item-prompt">${beat.prompt}</p>
          <span class="bm-history-item-model">musicgen-${beat.model}</span>
        </div>
      </div>
      <button class="bm-history-play-btn" aria-label="Load track"><i class="ti ti-player-play"></i></button>
    </li>
  `,
    )
    .join("");

  // Bind clicks back to old historic entries inside the track view
  historyList.querySelectorAll(".bm-history-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = parseInt(item.getAttribute("data-id"));
      const match = beatsHistory.find((b) => b.id === id);
      if (match) loadAudioTrack(match);
    });
  });
}
