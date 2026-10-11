package com.neonshift.game

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import kotlinx.coroutines.isActive
import androidx.compose.ui.platform.LocalContext
import androidx.compose.foundation.gestures.awaitEachGesture

/**
 * Drives frame-by-frame simulation via Compose's withFrameNanos, independent from
 * GameScreen's rendering. Restarts cleanly whenever gameStatus changes and never
 * leaks a coroutine — LaunchedEffect cancels the previous loop automatically.
 */
@Composable
fun GameLoopFrameDriver(gameStatus: GameStatus, onFrame: (dt: Float) -> Unit) {
    LaunchedEffect(gameStatus) {
        if (gameStatus != GameStatus.RUNNING) return@LaunchedEffect
        var lastFrameNanos = 0L
        while (isActive) {
            withFrameNanosCompat { frameTimeNanos ->
                if (lastFrameNanos != 0L) {
                    val dt = (frameTimeNanos - lastFrameNanos) / 1_000_000_000f
                    onFrame(dt)
                }
                lastFrameNanos = frameTimeNanos
            }
        }
    }
}

/** Thin wrapper so this file only needs the one Compose frame-clock import. */
private suspend inline fun withFrameNanosCompat(crossinline block: (Long) -> Unit) {
    androidx.compose.runtime.withFrameNanos { frameTimeNanos -> block(frameTimeNanos) }
}
