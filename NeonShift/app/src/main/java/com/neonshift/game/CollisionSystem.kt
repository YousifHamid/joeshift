package com.neonshift.game

import com.neonshift.obstacles.Obstacle
import com.neonshift.obstacles.ObstacleType
import com.neonshift.player.Player
import kotlin.math.abs

enum class CollisionResult { NONE, HAZARD_HIT, VOID_FALL }

object CollisionSystem {

    /** True if the player's lane places them within the obstacle's hit radius on X,
     *  and the obstacle is within Z-collision range of the fixed player Z. */
    private fun sameLaneAndInRange(player: Player, obstacle: Obstacle): Boolean {
        val zDist = abs(obstacle.z - GameConfig.PLAYER_Z)
        if (zDist > GameConfig.OBSTACLE_HITBOX_RADIUS + GameConfig.PLAYER_HITBOX_RADIUS) return false
        val obstacleX = player.laneCenterX(obstacle.lane)
        val xDist = abs(obstacleX - player.x)
        return xDist <= (GameConfig.OBSTACLE_HITBOX_RADIUS + GameConfig.PLAYER_HITBOX_RADIUS)
    }

    /** Evaluate a single obstacle against the player's current physical state. */
    fun evaluate(player: Player, obstacle: Obstacle): CollisionResult {
        if (!sameLaneAndInRange(player, obstacle)) return CollisionResult.NONE
        return when (obstacle.type) {
            ObstacleType.VOID_GAP ->
                if (player.isAirborne) CollisionResult.NONE else CollisionResult.VOID_FALL
            ObstacleType.GROUND_BARRIER, ObstacleType.HORIZONTAL_LASER ->
                if (player.isAirborne) CollisionResult.NONE else CollisionResult.HAZARD_HIT
        }
    }

    fun evaluateAll(player: Player, obstacles: List<Obstacle>): Pair<Obstacle, CollisionResult>? {
        for (o in obstacles) {
            val result = evaluate(player, o)
            if (result != CollisionResult.NONE) return o to result
        }
        return null
    }
}
