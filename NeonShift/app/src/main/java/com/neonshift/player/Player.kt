package com.neonshift.player

import com.neonshift.game.GameConfig

/**
 * Mutable runtime player state. The player sits at a fixed world Z; the world moves
 * toward it. Horizontal position is a discrete lane plus a continuous x (world units)
 * so lane-change tweening and rendering both work off the same source of truth.
 */
class Player(
    var lane: Int = 1,
    var x: Float = 0f,
    var targetLane: Int = 1,
    var laneChangeElapsed: Float = GameConfig.LANE_CHANGE_DURATION_S,
    var y: Float = GameConfig.GROUND_Y,
    var verticalVelocity: Float = 0f,
    var isAirborne: Boolean = false
) {
    fun laneCenterX(lane: Int): Float =
        (lane - (GameConfig.LANE_COUNT - 1) / 2f) * GameConfig.LANE_WIDTH

    fun startLaneChange(newLane: Int) {
        val clamped = newLane.coerceIn(0, GameConfig.LANE_COUNT - 1)
        if (clamped == targetLane) return
        targetLane = clamped
        laneChangeElapsed = 0f
    }

    fun jump() {
        if (!isAirborne) {
            isAirborne = true
            verticalVelocity = GameConfig.JUMP_VELOCITY
        }
    }

    fun reset() {
        lane = 1; targetLane = 1; x = laneCenterX(1)
        laneChangeElapsed = GameConfig.LANE_CHANGE_DURATION_S
        y = GameConfig.GROUND_Y; verticalVelocity = 0f; isAirborne = false
    }
}
