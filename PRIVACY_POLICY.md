# Privacy Policy for Luminar — Ocular Recovery & Deep Work HUD

**Effective Date:** November 18, 2026  
**Developer:** Dominik (Pdomea)  
**Contact:** domepesa.98@gmail.com

## 1. Overview & Zero-Data-Collection Commitment
**Luminar** operates **100% locally** inside your browser. We do **not** collect, transmit, store on external servers, sell, or share any personal data, browsing history, telemetry, or user activity.

## 2. Local Browser Storage (`chrome.storage`)
Luminar uses Chrome's local storage API (`chrome.storage.local` / `chrome.storage.sync`) exclusively to save your personal preferences and session states on your own device:
- Focus timer state and countdown timestamps (`luminar_engine_state`, `luminar_engine_endTime`)
- Preferred focus duration (`luminar_work_duration_minutes`)
- Completed ocular recovery counter (`luminar_pause_count`)
- Blue light filter state and intensity (`luminar_bluelight_active`, `luminar_bluelight_intensity`)
- Meeting mode shield status (`luminar_meeting_mode_active`)

None of this data ever leaves your device.

## 3. Permissions Used
- **`storage`**: Used solely to persist your timer settings, blue-light filter intensity, and completed session count locally.
- **`alarms`**: Used to trigger reliable background focus-timer transitions (`WORK_MODE` → `WARNING_MODE` → `RECOVERY_MODE`) in Manifest V3 service workers.
- **Content Scripts (`<all_urls>`)**: Used to render the draggable Stealth HUD, the warm Blue-Light Filter overlay, and the full-screen Ocular Recovery workouts on active web pages, as well as to locally check if the current tab hostname is a video call (`meet.google.com`, `zoom.us`, `teams.microsoft.com`, `webex.com`) so breaks never interrupt an active meeting. No page content or URLs are ever recorded or transmitted externally.

## 4. Third-Party Services
Luminar uses no third-party analytics, trackers, advertising SDKs, or external servers.

## 5. Changes to This Policy
Any updates to this Privacy Policy will be published in this repository. For questions, contact `domepesa.98@gmail.com`.
