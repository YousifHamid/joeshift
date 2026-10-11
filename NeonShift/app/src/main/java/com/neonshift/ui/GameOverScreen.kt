package com.neonshift.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.neonshift.game.GameUiState
import com.neonshift.ui.theme.DangerRed
import com.neonshift.ui.theme.NeonCyan
import com.neonshift.viewmodel.GameViewModel

@Composable
fun GameOverScreen(state: GameUiState, viewModel: GameViewModel) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.85f))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("RUN TERMINATED", color = DangerRed, fontWeight = FontWeight.Bold, fontSize = 22.sp)
        state.gameOverCause?.let {
            Text(it.replace("_", " ").uppercase(), color = Color.White.copy(alpha = 0.6f), fontSize = 12.sp)
        }
        Text("${state.score}", color = NeonCyan, fontWeight = FontWeight.Bold, fontSize = 40.sp,
            modifier = Modifier.testTag("final_score_display"))
        Text("${state.distanceMeters}m · ${state.shardsCollected} shards · ${state.nearMisses} near misses",
            color = Color.White, fontSize = 14.sp)
        Text("Max combo x${"%.1f".format(state.maxCombo)}", color = Color.White, fontSize = 14.sp)

        Button(onClick = viewModel::startGame, modifier = Modifier.testTag("run_again_button")) {
            Text("RUN AGAIN")
        }
        Button(onClick = viewModel::returnToMenu) {
            Text("MAIN MENU")
        }
    }
}

@Composable
fun PauseOverlay(onResume: () -> Unit, onMenu: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.7f)).padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("PAUSED", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
        Button(onClick = onResume) { Text("RESUME") }
        Button(onClick = onMenu) { Text("MAIN MENU") }
    }
}
