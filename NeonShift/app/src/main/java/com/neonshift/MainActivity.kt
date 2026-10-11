package com.neonshift

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.neonshift.game.GameStatus
import com.neonshift.ui.GameScreen
import com.neonshift.ui.MainMenuScreen
import com.neonshift.ui.theme.NeonShiftTheme
import com.neonshift.viewmodel.GameViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NeonShiftTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    NeonShiftApp(viewModel)
                }
            }
        }
    }

    override fun onPause() {
        super.onPause()
        viewModel.pauseGame()
    }
}

@Composable
fun NeonShiftApp(viewModel: GameViewModel) {
    val status by viewModel.uiState.collectAsState()
    when (status.status) {
        GameStatus.MENU -> MainMenuScreen(viewModel)
        else -> GameScreen(viewModel) // RUNNING, PAUSED, GAME_OVER all render within GameScreen
    }
}
