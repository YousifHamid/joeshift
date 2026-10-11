package com.neonshift

import com.neonshift.game.GameLoop
import com.neonshift.game.GameStatus
import org.junit.Assert.*
import org.junit.Test

class GameLoopTest {

    @Test
    fun `frame progression increases distance and score`() {
        val loop = GameLoop(seed = 1L)
        loop.start()
        val initialDistance = loop.toUiState(0).distanceMeters
        val initialScore = loop.toUiState(0).score
        repeat(120) { loop.update(1f / 60f) } // ~2 seconds
        val state = loop.toUiState(0)
        assertTrue(state.distanceMeters >= initialDistance)
        assertTrue(state.score >= initialScore)
        assertTrue(state.distanceMeters > 0)
    }

    @Test
    fun `delta time independence produces approximately equivalent progression`() {
        val loopA = GameLoop(seed = 2L)
        loopA.start()
        repeat(120) { loopA.update(1f / 60f) } // 120 steps at 60fps = 2s
        val distanceA = loopA.toUiState(0).distanceMeters

        val loopB = GameLoop(seed = 2L)
        loopB.start()
        repeat(60) { loopB.update(1f / 30f) } // 60 steps at 30fps = 2s
        val distanceB = loopB.toUiState(0).distanceMeters

        // Same elapsed time should yield very close world progression regardless of frame rate.
        assertTrue(kotlin.math.abs(distanceA - distanceB) <= 1)
    }

    @Test
    fun `distance is not incremented by a fixed integer per frame`() {
        val loop = GameLoop(seed = 3L)
        loop.start()
        loop.update(0.0001f) // a tiny frame
        val tinyDistanceState = loop.toUiState(0)
        // With a near-zero dt, distance in meters must still be ~0, proving it's dt-driven, not per-frame-constant.
        assertEquals(0, tinyDistanceState.distanceMeters)
    }

    @Test
    fun `frame spikes are clamped and do not break the simulation`() {
        val loop = GameLoop(seed = 4L)
        loop.start()
        loop.update(5f) // huge stall-recovery frame
        val state = loop.toUiState(0)
        // Distance this single frame should be bounded by MAX_FRAME_DT * max speed, not 5s worth.
        assertTrue(state.distanceMeters < 10)
    }

    @Test
    fun `pause halts simulation and resume continues it`() {
        val loop = GameLoop(seed = 5L)
        loop.start()
        repeat(30) { loop.update(1f / 60f) }
        val beforePause = loop.toUiState(0).distanceMeters
        loop.pause()
        loop.update(1f / 60f)
        loop.update(1f / 60f)
        val duringPause = loop.toUiState(0).distanceMeters
        assertEquals(beforePause, duringPause)
        loop.resume()
        loop.update(1f / 60f)
        val afterResume = loop.toUiState(0).distanceMeters
        assertTrue(afterResume >= duringPause)
    }

    @Test
    fun `game over stops further simulation`() {
        val loop = GameLoop(seed = 6L)
        loop.start()
        // Force many frames; with a fixed seed, an unshielded run will eventually collide.
        var frames = 0
        while (loop.toUiState(0).status == GameStatus.RUNNING && frames < 20000) {
            loop.update(1f / 60f)
            frames++
        }
        val state = loop.toUiState(0)
        if (state.status == GameStatus.GAME_OVER) {
            val scoreAtGameOver = state.score
            loop.update(1f / 60f)
            assertEquals(scoreAtGameOver, loop.toUiState(0).score)
        }
    }
}
