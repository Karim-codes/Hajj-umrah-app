This is a solid foundation with good information architecture, but there are specific gaps preventing it from feeling like a *premium* product. Here is my critical, actionable feedback organized by severity:

---

## 🔴 Critical (Fix Before Launch)

### 1. Eliminate All Emoji, Everywhere
**Problem:** You are using emoji (🕋, 🕌, ✂️, 🙏, 🏃) alongside system icons. This immediately signals "hobby project" rather than "professional product."
- **Screenshot 2:** The Kaaba at the top is an emoji.
- **Screenshot 5:** The mosque, running person, and sparkles are emojis.
- **Screenshot 1:** The settings gear is a system icon that clashes with your custom aesthetic.

**Fix:** Commission or create a unified icon set in your gold/navy palette. Every visual element should be a custom vector or consistently styled SF Symbol. The Kaaba specifically needs to be a refined illustration, not an emoji.

### 2. The "Road Map" Feels Like a Toy
**Problem:** The dotted path in Screenshot 5 looks like a constellation screensaver. The nodes float arbitrarily; there is no spatial logic connecting them. A pilgrim cannot look at this and understand *where* they physically are in the Haram.

**Fix:** 
- Make it a **vertical scroll** with a persistent, straight golden line running down the left side (like a real transit map).
- Place nodes on the line at proportional distances based on actual ritual flow.
- Use **filled vs. hollow** circles to show completed vs. upcoming steps.
- Add subtle **parallax** or **spring animations** as the user scrolls.

### 3. Empty States = Broken States
**Problem:** Screenshot 1 shows "Tap to set" for check-in/check-out. This looks like the app is unfinished. If a user is on a guided Umrah package, this data should auto-populate or be set during onboarding.

**Fix:** 
- If no hotel is set, show a **"Add Your Hotel"** CTA with a slick illustration, not grey placeholder text.
- Once set, show a **visual timeline** of their stay (e.g., a mini horizontal bar with nights counted down).

---

## 🟠 High Priority (Premium Feel)

### 4. Typography Hierarchy Needs Tightening
**Problem:** The Arabic and English text often compete rather than complement. In Screenshot 2, "الْعُمْرَة" is beautiful but its sizing and placement feel decorative rather than informational.

**Fix:**
- Use **one premium serif** for headings (like the "Umrah" title) and **one clean sans-serif** for body text. Currently it feels like 3-4 fonts are fighting.
- Reduce the size of the user's name ("Kemooo") on the home screen by ~30%. It dominates the viewport.
- Increase contrast on secondary text (dates, "8 Jul") — they are too dim against the navy.

### 5. The Pilgrim Card is 80% There
**Problem:** The journey card (Screenshot 1) is your hero element, but the moon icon connecting Madinah → Makkah is underwhelming. The corner brackets are a nice touch, but the card lacks depth.

**Fix:**
- Add a **subtle inner glow** or **glassmorphism** edge to the card.
- Replace the moon with a **miniature animated plane/bus icon** that moves along the line based on the current date.
- Show a **"Day 3 of 10"** progress pill inside the card so users never have to calculate where they are.

### 6. Expandable Steps Lack "Completion" Psychology
**Problem:** Screenshot 3 shows step details, but there is no way to mark "I have done this." If you want to replace notebooks, you must replace the satisfaction of checking a box.

**Fix:**
- Add a **circular checkmark** on each step that fills with gold when tapped.
- When checked, collapse the step and show a **gold strike-through** or "Completed" badge.
- Sync this to a **master progress ring** at the top of the screen (e.g., "3 of 12 complete").

---

## 🟡 Medium Priority (The "Go-To" Standard)

### 7. The Du'a Modal is Your Best Screen — Extend It
**Screenshot 4 is your strongest work.** The Arabic is crisp, the transliteration is highlighted correctly, and the translation is readable.

**Fix:**
- Add a **floating audio player bar** at the bottom of this modal for the Talbiyah recitation. This is where you beat PDFs.
- Allow users to **bookmark** du'as or mark them as "memorized."
- Add a **copy button** for the Arabic text (pilgrims often paste into WhatsApp to share with family).

### 8. Prayer Times Card Needs Context
**Problem:** Screenshot 1 shows Fajr at 04:19, but what timezone? What location? And why is Asr the "next prayer" at 15:53 when the current time is 12:39? (That math doesn't scan — 3h16m from 12:39 is 15:55, so it checks out, but the display is cramped.)

**Fix:**
- Add a **small location pill** ("Madinah") with a dot indicator.
- Show a **horizontal bar** visually representing the time between now and the next prayer.
- Consider a **full-screen prayer overlay** that appears 15 minutes before each prayer with the specific du'a for entering the mosque.

### 9. Bottom Navigation is Forgettable
**Problem:** The icons in Screenshot 1 are thin, grey, and generic. "Journey" and "Docs" are ambiguous.

**Fix:**
- Use **filled icons** for the active state with a subtle upward translate animation.
- "Docs" should probably be "Passport" or "Visa" — something more visceral. Or rename to "Travel."
- Add a **central floating action button** for the most-used feature (probably the Lap Counter or current step).

---

## 🟢 Polish (The Final 10%)

| Element | Current | Premium Fix |
|---------|---------|-------------|
| **Corner brackets** on cards | Static gold lines | Animate them drawing in on first view |
| **Stats row** (4 Pillars, 7+7 Laps) | Flat text | Add tappable info icons that reveal hadith sources |
| **"View Du'a" button** | Basic pill | Make it a **glassmorphic** button with a subtle shimmer |
| **Background** | Solid navy | Add a **very subtle, dark radial gradient** behind the Kaaba area to create focal depth |
| **Settings icon** | Generic gear | Custom profile icon (silhouette or initials) since this is personal |

---

## Strategic Product Advice

To become the "go-to" app that eliminates PDFs and phone notes, you need **two features** that paper cannot do:

1. **Offline-First Lap Counter** with haptic feedback (a light tap on the wrist for each Tawaf/Sa'i lap). This is your killer feature.
2. **Location-Aware Context** — when GPS detects the user is at the Kaaba, auto-surface the Tawaf du'a. When at Safa/Marwa, surface the Sa'i du'a. This requires careful battery optimization but is a massive differentiator.

