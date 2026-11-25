# 🚀 Chrome Web Store Submission Kit (Copy & Paste Ready)

Deine fertige Produktions-Datei liegt bereit unter:
👉 **`luminar/build/chrome-mv3-prod.zip`** (Version `1.0.0`, 150 KB)

Ich habe die `manifest.json` bereits so optimiert, dass alle ungenutzten Berechtigungen (`scripting`, `activeTab`, `tabs`) entfernt wurden. Das verhindert die häufigste Ablehnungsursache bei der automatischen Prüfung von Google!

---

## Schritt-für-Schritt Upload im Chrome Web Store

1. Öffne das **[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)** (einmalige Registrierungsgebühr: $5).
2. Klicke oben rechts auf **„Neues Element“ (New Item)** und lade die Datei **`luminar/build/chrome-mv3-prod.zip`** hoch.
3. Kopiere die folgenden Texte 1:1 in die entsprechenden Felder im Dashboard:

---

## 1. Tab: „Store-Eintrag“ (Store Listing)

### Titel (Name)
`Luminar — Ocular Recovery & Deep Work HUD`

### Kurzbeschreibung (Summary – max. 132 Zeichen)
`Gamified ocular recovery protocols, dynamic eye-tracking workouts, stealth focus HUD, and blue-light shield.`

### Ausführliche Beschreibung (Detailed Description)
```text
Luminar transforms screen-time fatigue into high-performance cognitive focus and structured ocular recovery.

Built for developers, designers, gamers, and deep-work professionals, Luminar combines a minimal draggable Stealth HUD with scientifically structured 60-second and 90-second neuro-ocular workouts.

⚡ KEY FEATURES

• Draggable Stealth HUD
A sleek, glassmorphic floating countdown orb that stays out of your way on any page—showing your live Deep Work timer, Blue-Light Shield toggle, and Meeting Shield at a glance.

• 5 Guided Ocular Recovery Workouts
When your focus block finishes, Luminar guides your eyes through structured recovery phases to release ciliary muscle spasm and restore your tear film:
1. Distance Gaze (Horizon relaxation)
2. Orb Pursuit (Smooth horizontal pursuit tracking)
3. Infinity Tracking (Figure-8 oculomotor calibration)
4. Corner Tracking (Diagonal saccadic range training)
5. Deep Blink Pulse (Tear-film restoration)

• Smart Auto-Meeting Shield
Automatically detects active calls on Google Meet, Zoom, Microsoft Teams, and Webex—or full-screen presentations—and delays screen breaks so you are never interrupted mid-call.

• Adaptive Blue-Light Filter
Instant 3-stage circadian warm filter (Low / Mid / High) directly accessible from the Popup or Stealth HUD.

• 100% Private & Local
Zero tracking, zero external servers, zero ads. All statistics and preferences stay strictly on your device.
```

### Kategorie (Category)
`Productivity` → `Workflow & Planning` (oder `Health & Lifestyle`)

### Sprache (Language)
`English` (oder `Deutsch`)

---

## 2. Tab: „Datenschutz“ (Privacy Practices) — EXTREM WICHTIG!

Hier fragt Google, warum deine Extension bestimmte Berechtigungen anfordert. Kopiere diese Antworten exakt hinein:

### Einziger Verwendungszweck (Single Purpose Description)
```text
Luminar provides a focus timer with a floating Stealth HUD, an adjustable blue-light screen filter, and guided full-screen eye-exercise breaks to prevent digital eye strain during deep work.
```

### Begründung für `alarms` (Alarms Permission Justification)
```text
Required to reliably schedule and trigger focus timer completions and ocular recovery break transitions in the Manifest V3 background service worker when the popup is closed.
```

### Begründung für `storage` (Storage Permission Justification)
```text
Required to locally store the user's focus timer duration preference, active timer countdown state, blue-light filter intensity settings, and completed ocular recovery session statistics on the user's device.
```

### Begründung für Host-Berechtigungen / Content Scripts (`<all_urls>` Justification)
```text
Required to display the floating Stealth HUD timer, apply the warm blue-light filter overlay across web pages the user is viewing, and render the full-screen guided eye-exercise recovery overlay when a focus session ends. Also checks locally if the active tab is a video-conferencing site (Meet, Zoom, Teams, Webex) to automatically pause breaks during meetings. No browsing data or page content is ever collected or transmitted.
```

### Verwendet die Erweiterung Remote-Code? (Remote Code)
- Wähle: **Nein, ich verwende keinen Remote-Code (No, I am not using Remote code)**

### Datennutzung (Data Usage Checkboxes)
- Setze bei **allen** Datentypen (Personenbezogene Daten, Gesundheitsdaten, Browserverlauf etc.) **KEINEN Haken**, da Luminar keinerlei Nutzerdaten sammelt oder versendet.
- Setze unten die **3 Pflicht-Häkchen** zur Bestätigung der Chrome Web Store-Richtlinien.

### Datenschutzerklärungs-URL (Privacy Policy URL)
Sobald wir dein Projekt auf GitHub gepusht und GitHub Pages aktiviert haben, kannst du dort einfach den Link zu deiner Live-Seite oder zur Datei `PRIVACY_POLICY.md` im GitHub-Repository eintragen!
*(Beispiel: `https://github.com/Pdomea/luminar/blob/main/PRIVACY_POLICY.md` oder `https://pdomea.github.io/luminar/privacy.html`)*
