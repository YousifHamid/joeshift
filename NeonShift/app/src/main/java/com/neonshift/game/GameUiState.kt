package com.neonshift.game

import com.neonshift.powerups.PowerUpType

/** Immutable snapshot handed to the UI layer every frame via StateFlow. */
data class GameUiState(
    val status: GameStatus = GameStatus.MENU,
    val score: Int = 0,
    val distanceMeters: Int = 0,
    val comboMultiplier: Float = 1f,
    val speed: Float = GameConfig.BASE_WORLD_SPEED,
    val isGridShifting: Boolean = false,
    val gridShiftWarning: Boolean = false,
    val activePowerUps: Set<PowerUpType> = emptySet(),
    val playerLane: Int = 1,
    val playerX: Float = 0f,
    val playerY: Float = 0f,
    val isJumping: Boolean = false,
    val tier: DifficultyTier = DifficultyTier.GRID_ZERO,
    val shardsCollected: Int = 0,
    val nearMisses: Int = 0,
    val maxCombo: Float = 1f,
    val gameOverCause: String? = null,
    // Render-friendly snapshots so GameScreen can draw without touching manager internals directly.
    val obstacleSnapshot: List<RenderObstacle> = emptyList(),
    val shardSnapshot: List<RenderShard> = emptyList(),
    val powerUpSnapshot: List<RenderPowerUp> = emptyList()
)

data class RenderObstacle(val id: String, val lane: Int, val z: Float, val type: String)
data class RenderShard(val id: String, val lane: Int, val z: Float)
data class RenderPowerUp(val id: String, val lane: Int, val z: Float, val type: PowerUpType)
