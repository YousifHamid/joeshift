package com.neonshift.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.neonshift.game.GameUiState
import com.neonshift.ui.theme.NeonCyan
import com.neonshift.ui.theme.NeonMagenta

@Composable
fun GameHud(state: GameUiState, modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxWidth().padding(16.dp)) {
        Text(
            text = "${state.score}",
            color = NeonCyan,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            fontSize = 34.sp,
            modifier = Modifier.testTag("current_score_display")
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "${state.distanceMeters}m",
                color = Color.White,
                fontFamily = FontFamily.Monospace,
                fontSize = 16.sp,
                modifier = Modifier.testTag("distance_display")
            )
            if (state.comboMultiplier > 1f) {
                Text(
                    text = "x${"%.1f".format(state.comboMultiplier)} COMBO",
                    color = NeonMagenta,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
            Text(
                text = state.tier.label,
                color = Color.White.copy(alpha = 0.7f),
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp
            )
        }
        if (state.activePowerUps.isNotEmpty()) {
            Text(
                text = state.activePowerUps.joinToString(" · ") { it.name },
                color = NeonCyan,
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp
            )
        }
        if (state.gridShiftWarning) {
            Text(
                text = "⚠ GRID SHIFT INCOMING",
                color = Color(0xFFFF2965),
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                fontSize = 14.sp
            )
        }
    }
}
