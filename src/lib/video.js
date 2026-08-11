// Exercise demo videos.
// An exercise with a video_url embeds that exact clip in-app (YouTube)
// or opens it in a new tab (anything else). Without one, the demo
// button opens a form-focused YouTube search for the exercise name —
// so every exercise has a working demo path with zero recording.

export function searchUrl(name) {
  return (
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(`${name} exercise proper form`)
  );
}

// YouTube watch / share / shorts links → privacy-enhanced embed URL.
// Returns null for non-YouTube links (open those in a new tab instead).
export function embedUrl(url) {
  const m = url?.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/
  );
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}
