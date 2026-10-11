package com.neonshift.powerups

enum class PowerUpType { PHASE_SHIELD, CHRONO_WARP, OVERDRIVE, ENERGY_MAGNET }

data class PowerUpPickup(
    val id: String,
    val type: PowerUpType,
    var z: Float,
    val lane: Int,
    var collected: Boolean = false
)

data class ActivePowerUp(
    val type: PowerUpType,
    var remainingSeconds: Float
)
