package com.neonshift

import com.neonshift.game.CollisionSystem
import com.neonshift.obstacles.CollisionResult
import com.neonshift.obstacles.Obstacle
import com.neonshift.obstacles.ObstacleType
import com.neonshift.player.Player
import org.junit.Assert.*
import org.junit.Test

class CollisionSystemTest {

    @Test
    fun `direct obstacle collision is detected in same lane`() {
        val player = Player(lane = 1, x = 0f) // lane 1 centers at x=0
        val obstacle = Obstacle("o1", ObstacleType.GROUND_BARRIER, z = 0f, lane = 1)
        val result = CollisionSystem.evaluate(player, obstacle)
        assertEquals(CollisionResult.HAZARD_HIT, result)
    }

    @Test
    fun `no collision when safely outside hitbox in a different lane`() {
        val player = Player(lane = 1, x = 0f)
        val obstacle = Obstacle("o2", ObstacleType.GROUND_BARRIER, z = 0f, lane = 2)
        val result = CollisionSystem.evaluate(player, obstacle)
        assertEquals(CollisionResult.NONE, result)
    }

    @Test
    fun `no collision when obstacle is far away in z`() {
        val player = Player(lane = 1, x = 0f)
        val obstacle = Obstacle("o3", ObstacleType.GROUND_BARRIER, z = 30f, lane = 1)
        val result = CollisionSystem.evaluate(player, obstacle)
        assertEquals(CollisionResult.NONE, result)
    }

    @Test
    fun `jumpable laser is avoided while airborne`() {
        val player = Player(lane = 1, x = 0f, isAirborne = true)
        val obstacle = Obstacle("o4", ObstacleType.HORIZONTAL_LASER, z = 0f, lane = 1)
        val result = CollisionSystem.evaluate(player, obstacle)
        assertEquals(CollisionResult.NONE, result)
    }

    @Test
    fun `void gap requires airborne to cross`() {
        val grounded = Player(lane = 1, x = 0f, isAirborne = false)
        val gap = Obstacle("o5", ObstacleType.VOID_GAP, z = 0f, lane = 1)
        assertEquals(CollisionResult.VOID_FALL, CollisionSystem.evaluate(grounded, gap))

        val airborne = Player(lane = 1, x = 0f, isAirborne = true)
        assertEquals(CollisionResult.NONE, CollisionSystem.evaluate(airborne, gap))
    }
}
