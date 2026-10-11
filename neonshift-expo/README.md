# JOESHIFT — Expo Go Native Mobile Game

> **Shift. Jump. Survive.**

A fast, futuristic cyberpunk infinite runner converted to React Native / Expo, running smoothly in **Expo Go** on iOS and Android.

---

## Quick Start (Run via Expo Go)

1. Open a terminal inside the project directory:
   ```bash
   cd neonshift-expo
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Open **Expo Go** on your device:
   - **Android**: Tap "Scan QR code" inside the Expo Go app.
   - **iOS**: Open the native Camera app and scan the terminal QR code to open in Expo Go.

---

## Controls

- **Lane Change**: Swipe Left / Right across the screen (or tap left/right thirds).
- **Jump**: Swipe Up (or tap center zone).
- **Virtual Buttons**: You can enable tactile on-screen controls in **Settings** (`Hybrid` or `Buttons` mode).

---

## Gameplay Mechanics

- **Lanes & Physics**: 3 lanes with smoothstep lane transitions and physical gravity.
- **Hazards**:
  - `GROUND BARRIER`: Neon red barricade — Jump over it.
  - `HORIZONTAL LASER`: High voltage laser beam — Jump over it.
  - `VOID GAP`: Hole in the neon grid — You MUST be airborne while crossing.
- **Power-Ups**:
  - `PHASE SHIELD`: Absorbs 1 fatal impact and clears the hazard.
  - `CHRONO WARP`: Slows down track speed by 45% for 5 seconds.
  - `2X OVERDRIVE`: Doubles all scoring generation for 6 seconds.
  - `ENERGY MAGNET`: Magnetically pulls energy shards from all lanes into your path for 7 seconds.
- **Near Misses**: Passing within 1.15m of an obstacle without hitting it awards **+25 points** and boosts your combo multiplier!
- **Grid Shift**: Periodic track shifts that test your reflexes with chromatic alerts and lane displacements.

---

## Architecture & Commands

- **Unit Tests**: `npm test`
- **Type Checking**: `npm run typecheck`
- **Bundle Verification**: `npx expo export`
- **Graphics Engine**: 60-120fps hardware-accelerated WebGL rendering via `expo-gl`.
- **Audio Synthesizer**: In-memory 0ms latency procedural PCM sound effects via `expo-av`.
- **Haptics**: Tactile feedback on swipe, jump, landing, near-miss, and collision via `expo-haptics`.
- **Persistence**: High score, distance, pilot callsign, and top 25 runs saved locally via `AsyncStorage`.
