# NEONSHIFT — Android Studio Project

Shift. Jump. Survive.

## How to open it
1. Unzip and open the `NeonShift/` folder in **Android Studio** (Hedgehog or newer)
   via File → Open. Let Gradle sync — it will pull dependencies from Google/Maven,
   which this build environment doesn't have network access to, so it hasn't been
   compiled here. The code has been checked for structural/syntax correctness
   (brace balance, imports, package layout) but **you'll want to build it once in
   Android Studio before trusting it end-to-end** — that's the honest status.
2. Run on a device/emulator (minSdk 24).
3. Run unit tests: right-click `app/src/test/java/com/neonshift` → Run Tests.

## What's real and working (not mocked)
- **GameLoop** (`game/GameLoop.kt`): authoritative delta-time simulation driven by
  Compose's `withFrameNanos` (`game/GameLoopLauncher.kt`), frame-spike clamped,
  pause/resume safe, modular (separate systems, not one giant method).
- **Physics**: real gravity/jump integration and smoothstep lane-tweening
  (`player/PlayerPhysics.kt`).
- **Touch controls**: framework-independent gesture classifier with configurable
  thresholds, correctly distinguishing horizontal/vertical/diagonal swipes, plus
  tap-zone and drag support (`player/TouchControlHandler.kt`).
- **Collision detection**: real X/Z/airborne-state box checks — ground barriers and
  lasers are jump-avoidable, void gaps require being airborne, Phase Shield
  correctly absorbs one hit and clears it (`game/CollisionSystem.kt`).
- **Near-miss, combo, score**: deterministic formula
  (distance + shards + near-misses) × combo × overdrive, documented in
  `game/ScoreManager.kt`; near-misses pay out exactly once per obstacle.
- **Difficulty/procedural generation**: four tiers with ramping speed and spawn
  rate; the track generator guarantees every row leaves at least one clear lane —
  no impossible or unavoidable configurations (`world/TrackGenerator.kt`).
- **Power-ups**: Phase Shield, Chrono Warp, 2X Overdrive, Energy Magnet — real
  pickup/duration/expiration logic.
- **Local persistence**: DataStore-backed best score/distance/gamer tag and a
  bounded local leaderboard, with safe fallback on corrupted data
  (`data/LocalGameRepository.kt`).
- **Unit tests**: GameLoop frame progression, delta-time independence, frame-spike
  clamping, pause/resume, collision cases, and every touch-gesture case from the
  spec's test list.

## What's intentionally marked NOT_IMPLEMENTED
- **Global leaderboard backend** (`data/LeaderboardRepository.kt`): there is no
  deployed server. This class defines the real client contract, queues runs
  offline, and returns an honest empty result rather than fabricating "live"
  rankings — per the spec's own instruction not to present simulated online
  results as real. Point `apiBaseUrl` at a real deployed endpoint (you'd need to
  build one — a small REST service with server-side score validation) to light
  it up.
- **Audio/haptics assets**: `GameEvent` (LaneChanged, Jumped, Collected, NearMiss,
  GridShiftStarted, ShieldConsumed, etc.) is fully wired and emitted from the
  GameLoop. There's no `AudioManager`/`HapticManager` subscriber yet and no sound
  files — that's a matter of dropping in assets and a ~20-line event subscriber,
  not a gameplay gap.
- **True 3D rendering**: Compose has no 3D engine. `ui/GameScreen.kt` draws a real,
  functional pseudo-3D perspective (vanishing-point lane grid, Z-scaled sprites) on
  Canvas rather than faking a 3D look with placeholder geometry. A true 3D mesh
  renderer would need an OpenGL/Filament/SceneView integration.
- **Grid Shift visual distortion**: the state machine (warning → distortion →
  shift → new layout) runs for real in GameLoop and drives HUD warnings and a grid
  color/offset change; the full "physically re-route obstacles" animation is a
  visual-polish layer on top of working state, not yet built out.
- **Compose UI instrumentation tests**: unit tests (JVM, `app/src/test`) are
  written and real; `app/src/androidTest` Compose UI tests are not included in this
  pass — the `testTag`s (`current_score_display`, `play_button`, `run_again_button`,
  `final_score_display`) are already in place for you or me to add them onto next.

## Next steps, if you want to keep going
1. Open in Android Studio, fix whatever Gradle/version drift shows up on first
   sync (dependency versions here are current as of this writing but the
   ecosystem moves).
2. Drop in real audio/haptic assets and wire `AudioManager`/`HapticManager` to
   `GameEvent`.
3. Stand up a minimal backend (even a simple authenticated REST endpoint with
   server-side score sanity checks) and point `LeaderboardRepository` at it.
4. Add Compose UI tests under `androidTest`.
