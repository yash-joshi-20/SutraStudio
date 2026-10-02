# SUTRA STUDIO — Mobile Companion App (React Native / Expo)

Cross-platform mobile companion application for **Sutra Studio** clients, built with Expo SDK 52 and React Native.

---

## 1. Feature Parity with Web Client Portal

- **Welcome & Auth**: Google Authentication and Work Email entry.
- **Home Command**: Studio greeting, Monthly plan allowance tracker, 4 Quick Actions, Recent Commissions list, and 12 Studio Disciplines carousel.
- **Orders Pipeline**: Milestone tracking, Deliverables review, and Google Drive download links.
- **Sutra AI Concierge**: Realtime creative brief intake assistant with 1-click prompt chips.
- **Projects Showcase**: Filterable portfolio assets and drive file references.
- **Account & Storage**: Billing statements, Google Drive Media Vault inspector, and session management.
- **New Commission Flow**: 4-step interactive commission intake stepper.

---

## 2. Design System & Luxury Aesthetics

- **Warm Ivory / Sand Theme**: Background `#F8F5EF`, Surface `#FFFDF9`, Card `#FFFFFF`.
- **Accents**: Deep Brown `#5C3A1E`, Saffron Gold `#D4A35A`.
- **Typography**: Inter Sans-Serif font hierarchy.

---

## 3. How to Run Locally

```bash
cd mobile
npm install
npm start
```

Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code with the **Expo Go** mobile app on your physical device.

---

## 4. Production Build (Expo EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform all
```
