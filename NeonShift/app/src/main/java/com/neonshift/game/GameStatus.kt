package com.neonshift.game

enum class GameStatus { MENU, RUNNING, PAUSED, GAME_OVER }

enum class DifficultyTier(val label: String) {
    GRID_ZERO("GRID ZERO"),
    CYBER_SHIFT("CYBER SHIFT"),
    HYPER_PULSE("HYPER PULSE"),
    OVERDRIVE("OVERDRIVE")
}
