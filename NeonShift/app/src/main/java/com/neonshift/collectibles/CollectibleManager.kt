package com.neonshift.collectibles

import com.neonshift.game.GameConfig
import com.neonshift.player.Player
import kotlin.math.abs

class CollectibleManager {
    private val _active = mutableListOf<EnergyShard>()
    val active: List<EnergyShard> get() = _active

    fun spawn(shard: EnergyShard) {
        _active.add(shard)
    }

    fun update(worldSpeed: Float, dt: Float) {
        val iterator = _active.iterator()
        while (iterator.hasNext()) {
            val s = iterator.next()
            s.z -= worldSpeed * dt
            if (s.z < GameConfig.DESPAWN_Z) iterator.remove()
        }
    }

    /** Checks pickup range, optionally widened by an active Energy Magnet's radius.
     *  Returns the shards collected this frame (already removed from `active`). */
    fun collectInRange(player: Player, magnetActive: Boolean): List<EnergyShard> {
        val radius = if (magnetActive) GameConfig.MAGNET_RADIUS else
            (GameConfig.OBSTACLE_HITBOX_RADIUS + GameConfig.PLAYER_HITBOX_RADIUS)
        val collected = mutableListOf<EnergyShard>()
        val iterator = _active.iterator()
        while (iterator.hasNext()) {
            val s = iterator.next()
            val zDist = abs(s.z - GameConfig.PLAYER_Z)
            if (zDist > radius) continue
            val shardX = player.laneCenterX(s.lane)
            val xDist = abs(shardX - player.x)
            if (xDist <= radius) {
                s.collected = true
                collected.add(s)
                iterator.remove()
            }
        }
        return collected
    }

    fun reset() = _active.clear()
}
