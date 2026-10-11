package com.neonshift.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.neonshift.ui.theme.GridDark
import com.neonshift.ui.theme.NeonCyan
import com.neonshift.ui.theme.NeonMagenta
import com.neonshift.viewmodel.GameViewModel

@Composable
fun MainMenuScreen(viewModel: GameViewModel) {
    val bestScore by viewModel.bestScore.collectAsState()
    val bestDistance by viewModel.bestDistance.collectAsState()

    Column(
        modifier = Modifier.fillMaxSize().background(GridDark).padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("NEONSHIFT", color = NeonCyan, fontWeight = FontWeight.Bold, fontSize = 40.sp)
        Text("Shift. Jump. Survive.", color = NeonMagenta, fontSize = 14.sp)
        Text("Best: $bestScore pts · ${bestDistance}m", color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)

        Button(onClick = viewModel::startGame, modifier = Modifier.testTag("play_button")) {
            Text("PLAY")
        }
    }
}
