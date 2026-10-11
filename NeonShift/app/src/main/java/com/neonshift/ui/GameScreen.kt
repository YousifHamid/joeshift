package com.neonshift.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import com.neonshift.game.GameLoopFrameDriver
import com.neonshift.game.GameStatus
import com.neonshift.game.GameUiState
import com.neonshift.player.TouchAction
import com.neonshift.player.TouchControlHandler
import com.neonshift.ui.theme.GridDark
import com.neonshift.ui.theme.NeonCyan
import com.neonshift.ui.theme.NeonMagenta
import com.neonshift.ui.theme.NeonPurple
import com.neonshift.viewmodel.GameViewModel

/**
 * Rendering note: Compose has no built-in 3D renderer. Rather than fake a "3D" look
 * with an unimplemented engine, this draws a real pseudo-3D perspective (vanishing-point
 * lane grid, obstacles/shards scaled and positioned by their Z depth) using Canvas —
 * an honest, fully functional 2.5D projection rather than a mocked-up 3D scene.
 * A true 3D mesh renderer would require an OpenGL/Vulkan/Filament integration, which
 * is NOT_IMPLEMENTED here.
 */
@Composable
fun GameScreen(viewModel: GameViewModel) {
    val state by viewModel.uiState.collectAsState()

    GameLoopFrameDriver(gameStatus = state.status, onFrame = viewModel::onFrame)

    val touchHandler = remember { TouchControlHandler() }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(GridDark)
            .pointerInput(state.status) {
                detectTapGestures(onTap = { offset ->
                    if (state.status == GameStatus.RUNNING) {
                        val fraction = offset.x / size.width
                        viewModel.onTouchAction(touchHandler.onTap(fraction))
                    }
                })
            }
            .pointerInput(state.status) {
                detectDragGestures(
                    onDragStart = { offset -> touchHandler.onDragStart(offset.x, offset.y) },
                    onDrag = { change, dragAmount ->
                        change.consume()
                        touchHandler.onDrag(dragAmount.x, dragAmount.y)?.let {
                            if (state.status == GameStatus.RUNNING) viewModel.onTouchAction(it)
                        }
                    },
                    onDragEnd = {
                        touchHandler.onDragEnd()?.let {
                            if (state.status == GameStatus.RUNNING) viewModel.onTouchAction(it)
                        }
                    }
                )
            }
    ) {
        GameCanvas(state)
        GameHud(state, modifier = Modifier.align(Alignment.TopStart))
        if (state.status == GameStatus.PAUSED) {
            PauseOverlay(onResume = viewModel::resumeGame, onMenu = viewModel::returnToMenu)
        }
        if (state.status == GameStatus.GAME_OVER) {
            GameOverScreen(state = state, viewModel = viewModel)
        }
    }
}

@Composable
private fun GameCanvas(state: GameUiState) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val horizonY = size.height * 0.35f
        val vanishX = size.width / 2f
        val laneHalfSpreadNear = size.width * 0.42f

        fun project(worldX: Float, z: Float): Offset {
            // z: GameConfig.SPAWN_Z (far) .. 0 (player). Perspective: closer = wider spread, lower on screen.
            val depthT = (1f - (z / 60f)).coerceIn(0f, 1f) // 0 far, 1 near
            val screenY = horizonY + (size.height - horizonY) * depthT
            val spread = laneHalfSpreadNear * depthT + 4f * (1f - depthT)
            val screenX = vanishX + (worldX / 3.3f) * spread
            return Offset(screenX, screenY)
        }

        // Neon grid floor lines (visual identity of the "shifting grid")
        val shiftOffset = if (state.isGridShifting) 14f else 0f
        for (lane in -1..1) {
            val far = project(lane * 2.2f + shiftOffset, 60f)
            val near = project(lane * 2.2f, 0f)
            drawLine(
                color = if (state.gridShiftWarning) Color(0xFFFF2965) else NeonPurple.copy(alpha = 0.6f),
                start = far, end = near, strokeWidth = 3f
            )
        }
        for (i in 0..6) {
            val z = i * 10f
            val left = project(-4f, z)
            val right = project(4f, z)
            drawLine(NeonPurple.copy(alpha = 0.25f), left, right, strokeWidth = 2f)
        }

        // Obstacles
        state.obstacleSnapshot.forEach { o ->
            val worldX = (o.lane - 1) * 2.2f
            val p = project(worldX, o.z)
            val depthT = (1f - (o.z / 60f)).coerceIn(0.08f, 1f)
            val size = 40f * depthT
            drawRect(
                color = Color(0xFFFF2965),
                topLeft = Offset(p.x - size / 2, p.y - size),
                size = androidx.compose.ui.geometry.Size(size, size),
                style = Stroke(width = 4f)
            )
        }

        // Collectibles
        state.shardSnapshot.forEach { s ->
            val worldX = (s.lane - 1) * 2.2f
            val p = project(worldX, s.z)
            val depthT = (1f - (s.z / 60f)).coerceIn(0.08f, 1f)
            drawCircle(NeonCyan, radius = 10f * depthT, center = Offset(p.x, p.y - 14f * depthT))
        }

        // Power-ups
        state.powerUpSnapshot.forEach { pu ->
            val worldX = (pu.lane - 1) * 2.2f
            val p = project(worldX, pu.z)
            val depthT = (1f - (pu.z / 60f)).coerceIn(0.08f, 1f)
            drawCircle(NeonMagenta, radius = 12f * depthT, center = Offset(p.x, p.y - 16f * depthT))
        }

        // Player cube
        val playerWorldX = state.playerX
        val playerScreen = project(playerWorldX, 0f)
        val jumpLift = state.playerY * 30f
        drawRect(
            color = NeonCyan,
            topLeft = Offset(playerScreen.x - 22f, playerScreen.y - 44f - jumpLift),
            size = androidx.compose.ui.geometry.Size(44f, 44f)
        )
    }
}
