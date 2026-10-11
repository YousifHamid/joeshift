package com.neonshift.game

import kotlin.math.min

object DifficultyManager {
    fun tierFor(distanceMeters: Int): DifficultyTier = when {
        distanceMeters >= GameConfig.TIER_OVERDRIVE_M -> DifficultyTier.OVERDRIVE
        distanceMeters >= GameConfig.TIER_HYPER_PULSE_M -> DifficultyTier.HYPER_PULSE
        distanceMeters >= GameConfig.TIER_CYBER_SHIFT_M -> DifficultyTier.CYBER_SHIFT
        else -> DifficultyTier.GRID_ZERO
    }

    /** World speed ramps smoothly with distance rather than jumping at tier boundaries. */
    fun speedFor(distanceMeters: Int, chronoWarpActive: Boolean): Float {
        val progress = min(distanceMeters / GameConfig.TIER_OVERDRIVE_M.toFloat(), 1.6f)
        val speed = GameConfig.BASE_WORLD_SPEED +
            (GameConfig.MAX_WORLD_SPEED - GameConfig.BASE_WORLD_SPEED) * min(progress, 1f)
        return if (chronoWarpActive) speed * GameConfig.CHRONO_WARP_SPEED_FACTOR else speed
    }

    /** Average seconds between obstacle spawns — shrinks (harder) as the tier rises. */
    fun spawnIntervalFor(tier: DifficultyTier): Float = when (tier) {
        DifficultyTier.GRID_ZERO -> 1.6f
        DifficultyTier.CYBER_SHIFT -> 1.2f
        DifficultyTier.HYPER_PULSE -> 0.9f
        DifficultyTier.OVERDRIVE -> 0.65f
    }

    /** Average seconds between Grid Shift events — more frequent at higher tiers. */
    fun gridShiftIntervalFor(tier: DifficultyTier): Float = when (tier) {
        DifficultyTier.GRID_ZERO -> Float.MAX_VALUE // no shifts yet
        DifficultyTier.CYBER_SHIFT -> 14f
        DifficultyTier.HYPER_PULSE -> 9f
        DifficultyTier.OVERDRIVE -> 5f
    }
}
