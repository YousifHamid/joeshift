package com.neonshift.obstacles

import com.neonshift.game.GameConfig

class ObstacleManager {
    private val _active = mutableListOf<Obstacle>()
    val active: List<Obstacle> get() = _active

    fun spawn(obstacle: Obstacle) {
        _active.add(obstacle)
    }

    /** Advance every obstacle toward the player and drop anything that's fully passed. */
    fun update(worldSpeed: Float, dt: Float) {
        val iterator = _active.iterator()
        while (iterator.hasNext()) {
            val o = iterator.next()
            o.z -= worldSpeed * dt
            if (o.z < GameConfig.DESPAWN_Z) iterator.remove()
        }
    }

    fun remove(obstacle: Obstacle) {
        _active.remove(obstacle)
    }

    fun reset() {
        _active.clear()
    }
}
