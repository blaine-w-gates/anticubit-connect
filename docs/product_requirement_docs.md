# Product: Cubit Connect (MVP)
**Type:** Static Client-Side Web Application
**Hosting:** GitHub Pages
**AI Integration:** Google Gemini API (`google-generative-ai`)

## Core Architecture (Critical)
1. **No Backend:** Static export (`output: 'export'`).
2. **Hybrid Storage Strategy:**
   - **LocalStorage:** User Settings (API Key, Theme).
   - **IndexedDB:** Large Data (Screenshots, Transcripts).
   - *Reason:* Prevents 5MB LocalStorage crash.
3. **Local Video Processing (Strict):**
   - **File Reference Only:** Do NOT store the video blob in DB. Use the OS file reference from the `<input>` element.
   - **Re-Hydration Logic:** On page reload, detect if `tasks` exist but `video` is missing. Show a "Resume Project: Re-Select Video" screen to restore the handle.
   - **Async Capture Queue:** Screenshots must be captured one-by-one using an event-driven queue (`seek` -> `wait for seeked event` -> `capture` -> `next`).

## Feature Logic
1. **Setup:**
   - User enters API Key.
   - **Validation:** App must perform a "Test Key" call (e.g., list models) before saving.
2. **Analysis:**
   - Parse VTT using a **Loose Regex Strategy** (tolerant of MacWhisper non-standard headers).
   - Send text to Gemini.
   - **Prompt Constraint:** "Return JSON array. Strip all Markdown formatting."
   - **Safety Handler:** Check `finishReason`. If `SAFETY`, show a graceful "Content blocked by AI Safety filters" message.
3. **Visual Extraction (Antigravity Enhanced):**
   - **Mobile Optimization:** Resize all captured frames to max-width 640px (JPEG 0.7 quality).
   - **List Virtualization:** The results list **MUST** use virtualization (e.g., `react-virtuoso`) to prevent DOM memory crashes when rendering 50+ images.
4. **Cubit Interface:**
   - **Context Aware:** Send task name + ~30s context to AI.
   - **Recursion Guard:** Max Depth = 1. Do NOT show the "Cubit" button on generated sub-steps.
   - **Rate Limiting:** distinct queue with `minDelay` (2000-4000ms) to respect Free Tier limits.

## Limitations & constraints
- **Video Formats:** Relies on browser native support. Users must provide compatible files (MP4/WebM usually).
- **Export:** No ffmpeg transcoding in MVP.
