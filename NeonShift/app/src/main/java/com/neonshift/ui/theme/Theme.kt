package com.neonshift.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val NeonCyan = Color(0xFF00F5FF)
val NeonMagenta = Color(0xFFFF00E5)
val NeonPurple = Color(0xFF7B2FFF)
val GridDark = Color(0xFF06060F)
val DangerRed = Color(0xFFFF2965)

private val scheme = darkColorScheme(
    primary = NeonCyan,
    secondary = NeonMagenta,
    background = GridDark,
    surface = GridDark
)

@Composable
fun NeonShiftTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = scheme, content = content)
}
