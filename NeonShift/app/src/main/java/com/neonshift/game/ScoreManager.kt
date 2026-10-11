package com.neonshift.game

/**
 * Deterministic score accumulator.
 *
 * score += (distanceThisFrame * DISTANCE_SCORE_PER_METER
 *           + shardEvents * SHARD_SCORE
 *           + nearMissEvents * NEAR_MISS_SCORE) * comboMultiplier * overdriveMultiplier
 *
 * Combo grows by COMBO_STEP per scoring event (shard or near miss), capped at COMBO_MAX,
 * and decays back to 1.0 after COMBO_DECAY_S seconds without a scoring event.
 */
class ScoreManager {
    var score: Int = 0
        private set
    var comboMultiplier: Float = 1f
        private set
    var maxComboReached: Float = 1f
        private set

    private var timeSinceLastEvent = 0f

    fun reset() {
        score = 0; comboMultiplier = 1f; maxComboReached = 1f; timeSinceLastEvent = 0f
    }

    fun tick(
        dt: Float,
        distanceDeltaMeters: Float,
        shardEvents: Int,
        nearMissEvents: Int,
        overdriveActive: Boolean
    ) {
        timeSinceLastEvent += dt
        if (timeSinceLastEvent >= GameConfig.COMBO_DECAY_S) {
            comboMultiplier = 1f
        }
        if (shardEvents > 0 || nearMissEvents > 0) {
            repeat(shardEvents + nearMissEvents) {
                comboMultiplier = (comboMultiplier + GameConfig.COMBO_STEP).coerceAtMost(GameConfig.COMBO_MAX)
            }
            timeSinceLastEvent = 0f
            maxComboReached = maxOf(maxComboReached, comboMultiplier)
        }

        val overdriveMult = if (overdriveActive) GameConfig.OVERDRIVE_SCORE_MULTIPLIER else 1f
        val raw = distanceDeltaMeters * GameConfig.DISTANCE_SCORE_PER_METER +
                shardEvents * GameConfig.SHARD_SCORE +
                nearMissEvents * GameConfig.NEAR_MISS_SCORE
        score += (raw * comboMultiplier * overdriveMult).toInt()
    }
}
