package com.neonshift.player

import com.neonshift.game.GameConfig
import kotlin.math.max
import kotlin.math.min

/** Pure functions over Player state so they're trivially unit-testable. */
object PlayerPhysics {

    /** Vertical jump/gravity integration. Returns true if the player just landed this frame. */
    fun updateVertical(player: Player, dt: Float): Boolean {
        if (!player.isAirborne) return false
        player.verticalVelocity += GameConfig.GRAVITY * dt
        player.y += player.verticalVelocity * dt
        if (player.y <= GameConfig.GROUND_Y) {
            player.y = GameConfig.GROUND_Y
            player.verticalVelocity = 0f
            player.isAirborne = false
            return true
        }
        return false
    }

    /** Horizontal lane-tween using smoothstep for a natural feel rather than a linear snap. */
    fun updateHorizontal(player: Player, dt: Float) {
        if (player.lane == player.targetLane && player.laneChangeElapsed >= GameConfig.LANE_CHANGE_DURATION_S) {
            player.x = player.laneCenterX(player.lane)
            return
        }
        val fromX = player.laneCenterX(player.lane)
        val toX = player.laneCenterX(player.targetLane)
        player.laneChangeElapsed = min(player.laneChangeElapsed + dt, GameConfig.LANE_CHANGE_DURATION_S)
        val t = player.laneChangeElapsed / GameConfig.LANE_CHANGE_DURATION_S
        val smooth = t * t * (3f - 2f * t)
        player.x = fromX + (toX - fromX) * smooth
        if (t >= 1f) player.lane = player.targetLane
    }

    fun clampDeltaTime(dt: Float): Float = max(0f, min(dt, GameConfig.MAX_FRAME_DT))
}
