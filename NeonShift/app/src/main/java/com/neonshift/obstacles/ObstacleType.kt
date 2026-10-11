package com.neonshift.obstacles

/**
 * requiresJumpToAvoid: ground obstacles / low barriers, avoided by jumping over them.
 * requiresAirborneToCross: void gaps — player must be airborne while crossing.
 */
enum class ObstacleType(
    val requiresJumpToAvoid: Boolean,
    val requiresAirborneToCross: Boolean
) {
    GROUND_BARRIER(requiresJumpToAvoid = true, requiresAirborneToCross = false),
    HORIZONTAL_LASER(requiresJumpToAvoid = true, requiresAirborneToCross = false),
    VOID_GAP(requiresJumpToAvoid = false, requiresAirborneToCross = true)
}
