package com.neonshift.powerups

import com.neonshift.game.GameConfig
import com.neonshift.player.Player
import kotlin.math.abs

class PowerUpManager {
    private val _pickups = mutableListOf<PowerUpPickup>()
    val pickups: List<PowerUpPickup> get() = _pickups

    private val _active = mutableMapOf<PowerUpType, ActivePowerUp>()
    val active: Map<PowerUpType, ActivePowerUp> get() = _active

    fun spawn(pickup: PowerUpPickup) {
        _pickups.add(pickup)
    }

    fun updatePickups(worldSpeed: Float, dt: Float) {
        val it = _pickups.iterator()
        while (it.hasNext()) {
            val p = it.next()
            p.z -= worldSpeed * dt
            if (p.z < GameConfig.DESPAWN_Z) it.remove()
        }
    }

    /** Ticks all active effect durations down, expiring any that hit zero.
     *  Returns the set of types that expired this frame. */
    fun tickActive(dt: Float): List<PowerUpType> {
        val expired = mutableListOf<PowerUpType>()
        val it = _active.entries.iterator()
        while (it.hasNext()) {
            val (type, effect) = it.next()
            effect.remainingSeconds -= dt
            if (effect.remainingSeconds <= 0f) {
                expired.add(type)
                it.remove()
            }
        }
        return expired
    }

    fun activate(type: PowerUpType) {
        val duration = when (type) {
            PowerUpType.PHASE_SHIELD -> GameConfig.PHASE_SHIELD_DURATION_S
            PowerUpType.CHRONO_WARP -> GameConfig.CHRONO_WARP_DURATION_S
            PowerUpType.OVERDRIVE -> GameConfig.OVERDRIVE_DURATION_S
            PowerUpType.ENERGY_MAGNET -> GameConfig.MAGNET_DURATION_S
        }
        _active[type] = ActivePowerUp(type, duration)
    }

    /** Consumes (removes) the Phase Shield if active. Returns true if one was consumed. */
    fun consumeShield(): Boolean {
        return if (_active.containsKey(PowerUpType.PHASE_SHIELD)) {
            _active.remove(PowerUpType.PHASE_SHIELD)
            true
        } else false
    }

    fun isActive(type: PowerUpType) = _active.containsKey(type)

    fun checkPickups(player: Player): List<PowerUpPickup> {
        val radius = GameConfig.OBSTACLE_HITBOX_RADIUS + GameConfig.PLAYER_HITBOX_RADIUS
        val collected = mutableListOf<PowerUpPickup>()
        val it = _pickups.iterator()
        while (it.hasNext()) {
            val p = it.next()
            val zDist = abs(p.z - GameConfig.PLAYER_Z)
            if (zDist > radius) continue
            val px = player.laneCenterX(p.lane)
            if (abs(px - player.x) <= radius) {
                p.collected = true
                collected.add(p)
                it.remove()
            }
        }
        return collected
    }

    fun reset() {
        _pickups.clear()
        _active.clear()
    }
}
