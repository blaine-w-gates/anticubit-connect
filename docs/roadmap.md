# Cubit Connect: V2 Roadmap

This document outlines the planned features and improvements for the next major version of Cubit Connect, as identified during the MVP completion.

## 1. The "Talking Head" AI Fix
**Objective:** Improve screenshot relevance.
**Current Behavior:** Uses a hard `+1.5s` offset from the timestamp found in the transcript.
**Proposed Solution:** Use Gemini to analyze the video context or transcript more deeply to identify the specific *timestamp of the action* (demonstration) versus the *timestamp of the speech* (introduction).

## 2. PDF Export (SOP Generation)
**Objective:** Create shareable documentation.
**Feature:** Add a "Export as PDF" button.
**Details:** Generate a formatted PDF guide containing the task names, descriptions, timestamps, and screenshots. This transforms the video analysis into a Standard Operating Procedure (SOP) document.

## 3. Cloud Sync (Optional)
**Objective:** Enable cross-device access.
**Proposed Solution:** Integrate a backend service (like Firebase config) to allow users to sync their local IndexedDB data to the cloud.
**Trade-off:** Moves away from the strict "Local-First" architecture but significantly improves user convenience.

## 4. Virtualized List Refinements
**Objective:** UI Scrubbing.
**Details:** Further optimizations to the `TaskFeed` virtualization for smoother scrolling with standard variable headers or extremely large datasets.
