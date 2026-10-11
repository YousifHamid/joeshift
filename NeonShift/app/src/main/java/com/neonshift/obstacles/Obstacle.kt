package com.neonshift.obstacles

data class Obstacle(
    val id: String,
    val type: ObstacleType,
    var z: Float,
    val lane: Int,
    var nearMissEvaluated: Boolean = false,
    var passed: Boolean = false
)
