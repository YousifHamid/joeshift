package com.neonshift.world

import com.neonshift.collectibles.EnergyShard
import com.neonshift.game.DifficultyTier
import com.neonshift.game.DifficultyManager
import com.neonshift.game.GameConfig
import com.neonshift.obstacles.Obstacle
import com.neonshift.obstacles.ObstacleType
import com.neonshift.powerups.PowerUpPickup
import com.neonshift.powerups.PowerUpType
import kotlin.random.Random

data class SpawnBatch(
    val obstacles: List<Obstacle> = emptyList(),
    val shards: List<EnergyShard> = emptyList(),
    val powerUps: List<PowerUpPickup> = emptyList()
)

/**
 * Procedural, seeded spawner. Guarantees every generated row is passable: it never
 * places an unavoidable full-lane blockade, never puts a collectible somewhere the
 * player can't reach, and always leaves at least one clear lane (or a jumpable path)
 * across every obstacle row it emits.
 */
class TrackGenerator(seed: Long = System.currentTimeMillis()) {
    private val random = Random(seed)
    private var idCounter = 0
    private fun nextId(prefix: String) = "$prefix-${idCounter++}"

    /** Generates one "row" of content at the given spawn Z, appropriate for the tier. */
    fun generateRow(z: Float, tier: DifficultyTier): SpawnBatch {
        val obstacles = mutableListOf<Obstacle>()
        val shards = mutableListOf<EnergyShard>()
        val powerUps = mutableListOf<PowerUpPickup>()

        val laneCount = GameConfig.LANE_COUNT
        val blockedLanes = mutableSetOf<Int>()

        // Decide how many lanes get an obstacle this row. Never block every lane —
        // always guarantee at least one fully clear lane (laneCount - 1 blocked max),
        // and only allow that many at higher tiers.
        val maxBlocked = when (tier) {
            DifficultyTier.GRID_ZERO -> 1
            DifficultyTier.CYBER_SHIFT -> 1
            DifficultyTier.HYPER_PULSE -> laneCount - 1
            DifficultyTier.OVERDRIVE -> laneCount - 1
        }
        val obstacleChance = when (tier) {
            DifficultyTier.GRID_ZERO -> 0.5f
            DifficultyTier.CYBER_SHIFT -> 0.65f
            DifficultyTier.HYPER_PULSE -> 0.8f
            DifficultyTier.OVERDRIVE -> 0.85f
        }

        if (random.nextFloat() < obstacleChance) {
            val blockCount = (1..maxBlocked).random(random)
            val lanes = (0 until laneCount).shuffled(random).take(blockCount)
            val availableTypes = if (tier == DifficultyTier.GRID_ZERO)
                listOf(ObstacleType.GROUND_BARRIER)
            else ObstacleType.values().toList()

            for (lane in lanes) {
                val type = availableTypes.random(random)
                obstacles.add(Obstacle(nextId("obs"), type, z, lane))
                blockedLanes.add(lane)
            }
        }

        // Collectibles: only ever placed in a lane that's clear at this row, so they're
        // always reachable without requiring an impossible dodge-and-collect.
        val openLanes = (0 until laneCount).filterNot { it in blockedLanes }
        if (openLanes.isNotEmpty() && random.nextFloat() < 0.6f) {
            val lane = openLanes.random(random)
            shards.add(EnergyShard(nextId("shard"), z, lane))
        }

        if (openLanes.isNotEmpty() && random.nextFloat() < 0.03f) {
            val lane = openLanes.random(random)
            powerUps.add(PowerUpPickup(nextId("pu"), PowerUpType.values().random(random), z, lane))
        }

        return SpawnBatch(obstacles, shards, powerUps)
    }
}
