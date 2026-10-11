package com.neonshift.game

import com.neonshift.powerups.PowerUpType

/**
 * Fire-and-forget gameplay events. GameLoop emits these; audio/haptic/analytics
 * systems subscribe without gameplay logic needing to know about Android APIs.
 */
sealed class GameEvent {
    data class LaneChanged(val fromLane: Int, val toLane: Int) : GameEvent()
    object Jumped : GameEvent()
    object Landed : GameEvent()
    data class Collected(val shardId: String) : GameEvent()
    data class PowerUpActivated(val type: PowerUpType) : GameEvent()
    data class PowerUpExpired(val type: PowerUpType) : GameEvent()
    data class NearMiss(val obstacleId: String) : GameEvent()
    object GridShiftWarning : GameEvent()
    object GridShiftStarted : GameEvent()
    object GridShiftEnded : GameEvent()
    object ShieldConsumed : GameEvent()
    data class Collision(val cause: String) : GameEvent()
    object GameOver : GameEvent()
    data class NewHighScore(val score: Int) : GameEvent()
}
