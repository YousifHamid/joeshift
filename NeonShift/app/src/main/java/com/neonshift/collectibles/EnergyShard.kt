package com.neonshift.collectibles

data class EnergyShard(
    val id: String,
    var z: Float,
    var lane: Int,
    var collected: Boolean = false
)
