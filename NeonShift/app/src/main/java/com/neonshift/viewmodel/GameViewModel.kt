package com.neonshift.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.neonshift.data.LeaderboardRepository
import com.neonshift.data.LocalGameRepository
import com.neonshift.data.LocalRecord
import com.neonshift.game.GameEvent
import com.neonshift.game.GameLoop
import com.neonshift.game.GameStatus
import com.neonshift.game.GameUiState
import com.neonshift.player.TouchAction
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * Owns the GameLoop instance and exposes observable state to GameScreen. The
 * ViewModel does not run its own timer — GameLoop.update(dt) is the sole authoritative
 * clock, driven by GameLoop.Launched (see ui/GameScreen.kt) via withFrameNanos.
 */
class GameViewModel(application: Application) : AndroidViewModel(application) {

    private val localRepo = LocalGameRepository(application)
    private val leaderboardRepo = LeaderboardRepository(apiBaseUrl = null) // no backend deployed yet

    private val events = MutableSharedFlow<GameEvent>(extraBufferCapacity = 32)
    val gameEvents: SharedFlow<GameEvent> = events

    private var bestScoreCache = 0

    private val gameLoop = GameLoop(onEvent = { events.tryEmit(it) })

    private val _uiState = MutableStateFlow(GameUiState())
    val uiState: StateFlow<GameUiState> = _uiState.asStateFlow()

    val score: StateFlow<Int> = uiState.map { it.score }
        .stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.Eagerly, 0)
    val distanceMeters: StateFlow<Int> = uiState.map { it.distanceMeters }
        .stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.Eagerly, 0)

    val bestScore: StateFlow<Int> = localRepo.bestScore
        .stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.Eagerly, 0)
    val bestDistance: StateFlow<Int> = localRepo.bestDistance
        .stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.Eagerly, 0)
    val gamerTag: StateFlow<String> = localRepo.gamerTag
        .stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.Eagerly, "PLAYER")

    init {
        viewModelScope.launch {
            bestScore.collect { bestScoreCache = it }
        }
    }

    fun startGame() {
        gameLoop.start()
        publish()
    }

    fun pauseGame() { gameLoop.pause(); publish() }
    fun resumeGame() { gameLoop.resume(); publish() }

    fun returnToMenu() {
        _uiState.value = GameUiState(status = GameStatus.MENU)
    }

    fun setGamerTag(tag: String) {
        viewModelScope.launch { localRepo.setGamerTag(tag) }
    }

    /** Called once per animation frame by GameLoop.Launched with the real elapsed dt. */
    fun onFrame(dt: Float) {
        val wasRunning = gameLoop.status == GameStatus.RUNNING
        gameLoop.update(dt)
        publish()
        if (wasRunning && gameLoop.status == GameStatus.GAME_OVER) {
            persistFinishedRun()
        }
    }

    fun onTouchAction(action: TouchAction) {
        when (action) {
            is TouchAction.MoveLeft -> gameLoop.requestLaneLeft()
            is TouchAction.MoveRight -> gameLoop.requestLaneRight()
            is TouchAction.Jump -> gameLoop.requestJump()
            is TouchAction.Drag -> gameLoop.requestDrag(action.deltaXPx, pxPerLane = 140f)
        }
    }

    private fun publish() {
        _uiState.value = gameLoop.toUiState(bestScoreCache)
    }

    private fun persistFinishedRun() {
        val state = _uiState.value
        bestScoreCache = maxOf(bestScoreCache, state.score)
        viewModelScope.launch {
            val tag = gamerTag.value
            val record = LocalRecord(
                runId = localRepo.newRunId(),
                gamerTag = tag,
                score = state.score,
                distanceMeters = state.distanceMeters,
                shardsCollected = state.shardsCollected,
                nearMisses = state.nearMisses,
                maxCombo = state.maxCombo,
                timestampMillis = System.currentTimeMillis()
            )
            localRepo.saveRun(record)
            // Best-effort global submission; queued locally since no backend is deployed
            // (see LeaderboardRepository — this never fabricates a "live" result).
            leaderboardRepo.submit(record)
        }
    }
}
