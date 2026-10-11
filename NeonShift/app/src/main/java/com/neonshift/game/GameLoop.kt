package com.neonshift.game

import com.neonshift.collectibles.CollectibleManager
import com.neonshift.obstacles.CollisionResult
import com.neonshift.obstacles.ObstacleManager
import com.neonshift.player.Player
import com.neonshift.player.PlayerPhysics
import com.neonshift.powerups.PowerUpManager
import com.neonshift.powerups.PowerUpType
import com.neonshift.world.TrackGenerator
import kotlin.math.floor

/**
 * Authoritative, frame-by-frame gameplay simulation. Holds no Android/Compose
 * dependencies so it's directly unit-testable. GameViewModel drives it via update(dt)
 * and reads back the published GameUiState / event stream.
 */
class GameLoop(
    seed: Long = System.currentTimeMillis(),
    private val onEvent: (GameEvent) -> Unit = {}
) {
    val player = Player()
    val obstacleManager = ObstacleManager()
    val collectibleManager = CollectibleManager()
    val powerUpManager = PowerUpManager()
    private val scoreManager = ScoreManager()
    private val trackGenerator = TrackGenerator(seed)

    var status: GameStatus = GameStatus.MENU
        private set

    private var totalDistance = 0f
    private var lastSpawnZ = GameConfig.SPAWN_Z
    private var timeSinceLastSpawn = 0f
    private var timeSinceLastGridShift = 0f

    private var isGridShifting = false
    private var gridShiftWarningActive = false
    private var gridShiftTimer = 0f

    private var shardsCollected = 0
    private var nearMisses = 0
    private var gameOverCause: String? = null

    fun start() {
        reset()
        status = GameStatus.RUNNING
    }

    fun pause() { if (status == GameStatus.RUNNING) status = GameStatus.PAUSED }
    fun resume() { if (status == GameStatus.PAUSED) status = GameStatus.RUNNING }

    private fun reset() {
        player.reset()
        obstacleManager.reset()
        collectibleManager.reset()
        powerUpManager.reset()
        scoreManager.reset()
        totalDistance = 0f
        lastSpawnZ = GameConfig.SPAWN_Z
        timeSinceLastSpawn = 0f
        timeSinceLastGridShift = 0f
        isGridShifting = false
        gridShiftWarningActive = false
        gridShiftTimer = 0f
        shardsCollected = 0
        nearMisses = 0
        gameOverCause = null
    }

    // --- Input entry points (called by GameViewModel in response to TouchActions) ---
    fun requestLaneLeft() {
        if (status != GameStatus.RUNNING) return
        val from = player.targetLane
        player.startLaneChange(player.targetLane - 1)
        if (player.targetLane != from) onEvent(GameEvent.LaneChanged(from, player.targetLane))
    }

    fun requestLaneRight() {
        if (status != GameStatus.RUNNING) return
        val from = player.targetLane
        player.startLaneChange(player.targetLane + 1)
        if (player.targetLane != from) onEvent(GameEvent.LaneChanged(from, player.targetLane))
    }

    fun requestDrag(deltaXPx: Float, pxPerLane: Float) {
        if (status != GameStatus.RUNNING || pxPerLane <= 0f) return
        // Sub-lane precision: convert an accumulated drag into a lane step once it
        // crosses half a lane's worth of pixels.
        if (kotlin.math.abs(deltaXPx) >= pxPerLane / 2f) {
            if (deltaXPx < 0) requestLaneLeft() else requestLaneRight()
        }
    }

    fun requestJump() {
        if (status != GameStatus.RUNNING) return
        if (!player.isAirborne) {
            player.jump()
            onEvent(GameEvent.Jumped)
        }
    }

    /** Single authoritative frame update. dt is clamped internally against stalls/spikes. */
    fun update(dt: Float) {
        if (status != GameStatus.RUNNING) return
        val safeDt = PlayerPhysics.clampDeltaTime(dt)

        val tier = DifficultyManager.tierFor(floor(totalDistance).toInt())
        val chronoActive = powerUpManager.isActive(PowerUpType.CHRONO_WARP)
        val speed = DifficultyManager.speedFor(floor(totalDistance).toInt(), chronoActive)

        updateGridShift(safeDt, tier)
        updatePlayer(safeDt)
        updateWorldAndSpawns(safeDt, speed, tier)
        val shardEvents = updateCollectibles(speed, safeDt)
        updatePowerUps(speed, safeDt)
        val nearMissEvents = updateNearMisses()
        val collided = updateCollisions()

        val distanceDeltaMeters = speed * safeDt
        totalDistance += distanceDeltaMeters
        scoreManager.tick(
            dt = safeDt,
            distanceDeltaMeters = distanceDeltaMeters,
            shardEvents = shardEvents,
            nearMissEvents = nearMissEvents,
            overdriveActive = powerUpManager.isActive(PowerUpType.OVERDRIVE)
        )

        if (collided) {
            status = GameStatus.GAME_OVER
            onEvent(GameEvent.GameOver)
        }
    }

    private fun updatePlayer(dt: Float) {
        val landed = PlayerPhysics.updateVertical(player, dt)
        if (landed) onEvent(GameEvent.Landed)
        PlayerPhysics.updateHorizontal(player, dt)
    }

    private fun updateGridShift(dt: Float, tier: DifficultyTier) {
        val interval = DifficultyManager.gridShiftIntervalFor(tier)
        if (isGridShifting) {
            gridShiftTimer -= dt
            if (gridShiftTimer <= 0f) {
                isGridShifting = false
                onEvent(GameEvent.GridShiftEnded)
                timeSinceLastGridShift = 0f
            }
            return
        }
        if (gridShiftWarningActive) {
            gridShiftTimer -= dt
            if (gridShiftTimer <= 0f) {
                gridShiftWarningActive = false
                isGridShifting = true
                gridShiftTimer = GameConfig.GRID_SHIFT_DURATION_S
                onEvent(GameEvent.GridShiftStarted)
            }
            return
        }
        timeSinceLastGridShift += dt
        if (timeSinceLastGridShift >= interval) {
            gridShiftWarningActive = true
            gridShiftTimer = GameConfig.GRID_SHIFT_WARNING_S
            onEvent(GameEvent.GridShiftWarning)
        }
    }

    private fun updateWorldAndSpawns(dt: Float, speed: Float, tier: DifficultyTier) {
        obstacleManager.update(speed, dt)
        val spawnInterval = DifficultyManager.spawnIntervalFor(tier)
        timeSinceLastSpawn += dt
        if (timeSinceLastSpawn >= spawnInterval) {
            timeSinceLastSpawn = 0f
            val batch = trackGenerator.generateRow(GameConfig.SPAWN_Z, tier)
            batch.obstacles.forEach { obstacleManager.spawn(it) }
            batch.shards.forEach { collectibleManager.spawn(it) }
            batch.powerUps.forEach { powerUpManager.spawn(it) }
        }
    }

    private fun updateCollectibles(speed: Float, dt: Float): Int {
        collectibleManager.update(worldSpeed = speed, dt = dt)
        val magnetActive = powerUpManager.isActive(PowerUpType.ENERGY_MAGNET)
        val collected = collectibleManager.collectInRange(player, magnetActive)
        collected.forEach {
            shardsCollected++
            onEvent(GameEvent.Collected(it.id))
        }
        return collected.size
    }

    private fun updatePowerUps(speed: Float, dt: Float) {
        powerUpManager.updatePickups(speed, dt)
        val expired = powerUpManager.tickActive(dt)
        expired.forEach { onEvent(GameEvent.PowerUpExpired(it)) }
        val collected = powerUpManager.checkPickups(player)
        collected.forEach {
            powerUpManager.activate(it.type)
            onEvent(GameEvent.PowerUpActivated(it.type))
        }
    }

    private fun updateNearMisses(): Int {
        val misses = NearMissSystem.collectNewNearMisses(player, obstacleManager.active)
        misses.forEach {
            nearMisses++
            onEvent(GameEvent.NearMiss(it.id))
        }
        return misses.size
    }

    /** Returns true if this frame ended the run (unshielded collision). */
    private fun updateCollisions(): Boolean {
        val hit = CollisionSystem.evaluateAll(player, obstacleManager.active) ?: return false
        val (obstacle, result) = hit
        if (result == CollisionResult.NONE) return false

        val cause = if (result == CollisionResult.VOID_FALL) "void_gap" else obstacle.type.name
        if (powerUpManager.consumeShield()) {
            onEvent(GameEvent.ShieldConsumed)
            obstacleManager.remove(obstacle) // the hazard is cleared by the shield break
            return false
        }
        gameOverCause = cause
        onEvent(GameEvent.Collision(cause))
        return true
    }

    fun toUiState(bestScore: Int): GameUiState {
        val distanceMetersInt = floor(totalDistance).toInt()
        val tier = DifficultyManager.tierFor(distanceMetersInt)
        val newHighScore = status == GameStatus.GAME_OVER && scoreManager.score > bestScore
        if (newHighScore) onEvent(GameEvent.NewHighScore(scoreManager.score))
        return GameUiState(
            status = status,
            score = scoreManager.score,
            distanceMeters = distanceMetersInt,
            comboMultiplier = scoreManager.comboMultiplier,
            speed = DifficultyManager.speedFor(distanceMetersInt, powerUpManager.isActive(PowerUpType.CHRONO_WARP)),
            isGridShifting = isGridShifting,
            gridShiftWarning = gridShiftWarningActive,
            activePowerUps = powerUpManager.active.keys,
            playerLane = player.lane,
            playerX = player.x,
            playerY = player.y,
            isJumping = player.isAirborne,
            tier = tier,
            shardsCollected = shardsCollected,
            nearMisses = nearMisses,
            maxCombo = scoreManager.let { it.maxComboReached },
            gameOverCause = gameOverCause,
            obstacleSnapshot = obstacleManager.active.map {
                RenderObstacle(it.id, it.lane, it.z, it.type.name)
            },
            shardSnapshot = collectibleManager.active.map { RenderShard(it.id, it.lane, it.z) },
            powerUpSnapshot = powerUpManager.pickups.map { RenderPowerUp(it.id, it.lane, it.z, it.type) }
        )
    }
}
