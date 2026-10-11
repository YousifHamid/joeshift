package com.neonshift.game

import com.neonshift.obstacles.Obstacle
import com.neonshift.player.Player
import kotlin.math.abs

object NearMissSystem {
    /**
     * Returns the obstacles that qualify as a near miss this frame: the player passed
     * within NEAR_MISS_RADIUS without actually colliding, and it hasn't been rewarded
     * for this obstacle before. Marks obstacles as evaluated so each one pays out once.
     */
    fun collectNewNearMisses(player: Player, obstacles: List<Obstacle>): List<Obstacle> {
        val results = mutableListOf<Obstacle>()
        for (o in obstacles) {
            if (o.nearMissEvaluated) continue
            val zDist = abs(o.z - GameConfig.PLAYER_Z)
            if (zDist > GameConfig.NEAR_MISS_RADIUS) continue
            val obstacleX = player.laneCenterX(o.lane)
            val xDist = abs(obstacleX - player.x)
            val hitboxSum = GameConfig.OBSTACLE_HITBOX_RADIUS + GameConfig.PLAYER_HITBOX_RADIUS
            val isColliding = xDist <= hitboxSum && CollisionSystem.evaluate(player, o) != CollisionResult.NONE
            if (!isColliding && xDist <= GameConfig.NEAR_MISS_RADIUS) {
                o.nearMissEvaluated = true
                results.add(o)
            }
            // Mark evaluated once the obstacle has fully passed the player, even without
            // a near miss, so it's never retroactively rewarded.
            if (o.z < GameConfig.PLAYER_Z - GameConfig.NEAR_MISS_RADIUS) {
                o.nearMissEvaluated = true
            }
        }
        return results
    }
}
