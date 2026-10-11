package com.neonshift.game

/** Central tunable constants. Values chosen for comfortable mobile play; adjust freely. */
object GameConfig {
    const val LANE_COUNT = 3
    const val LANE_WIDTH = 2.2f
    const val LANE_CHANGE_DURATION_S = 0.16f

    const val GRAVITY = -32f
    const val JUMP_VELOCITY = 11f
    const val GROUND_Y = 0f

    const val BASE_WORLD_SPEED = 9f
    const val MAX_WORLD_SPEED = 34f

    const val SPAWN_Z = 60f
    const val DESPAWN_Z = -6f
    const val PLAYER_Z = 0f

    const val OBSTACLE_HITBOX_RADIUS = 0.55f
    const val PLAYER_HITBOX_RADIUS = 0.45f
    const val NEAR_MISS_RADIUS = 1.15f

    const val COMBO_DECAY_S = 2.5f
    const val COMBO_STEP = 0.1f
    const val COMBO_MAX = 4.0f

    const val SHARD_SCORE = 15
    const val NEAR_MISS_SCORE = 25
    const val DISTANCE_SCORE_PER_METER = 1

    const val PHASE_SHIELD_DURATION_S = 8f
    const val CHRONO_WARP_DURATION_S = 5f
    const val CHRONO_WARP_SPEED_FACTOR = 0.55f
    const val OVERDRIVE_DURATION_S = 6f
    const val OVERDRIVE_SCORE_MULTIPLIER = 2f
    const val MAGNET_DURATION_S = 7f
    const val MAGNET_RADIUS = 3.5f

    const val MAX_FRAME_DT = 0.1f

    const val TIER_CYBER_SHIFT_M = 400
    const val TIER_HYPER_PULSE_M = 1100
    const val TIER_OVERDRIVE_M = 2200

    const val GRID_SHIFT_WARNING_S = 1.2f
    const val GRID_SHIFT_DURATION_S = 0.9f
}
