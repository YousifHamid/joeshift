package com.neonshift.player

/** Actions the touch handler produces. GameViewModel receives these, never raw coordinates. */
sealed class TouchAction {
    object MoveLeft : TouchAction()
    object MoveRight : TouchAction()
    object Jump : TouchAction()
    data class Drag(val deltaXPx: Float) : TouchAction()
}

/**
 * Pure, framework-independent gesture classifier. GameScreen feeds it raw pointer
 * deltas via detectDragGestures/detectTapGestures; this class contains all the
 * threshold logic so it's unit-testable without Compose or Android instrumentation.
 */
class TouchControlHandler(
    private val horizontalSwipeThresholdPx: Float = 60f,
    private val verticalSwipeThresholdPx: Float = 60f,
    private val dragSensitivity: Float = 1f
) {
    private var startX = 0f
    private var startY = 0f
    private var accumX = 0f
    private var accumY = 0f
    private var dragging = false

    fun onDragStart(x: Float, y: Float) {
        startX = x; startY = y; accumX = 0f; accumY = 0f; dragging = true
    }

    /** Call for each incremental drag frame. Returns a Drag action for sub-lane tracking,
     *  or null while the gesture is still ambiguous. */
    fun onDrag(deltaX: Float, deltaY: Float): TouchAction? {
        accumX += deltaX
        accumY += deltaY
        val isPrimarilyHorizontal = kotlin.math.abs(accumX) > kotlin.math.abs(accumY)
        return if (isPrimarilyHorizontal && kotlin.math.abs(accumX) >= 4f) {
            TouchAction.Drag(deltaX * dragSensitivity)
        } else null
    }

    /** Call on gesture end. Classifies the accumulated gesture into a discrete action,
     *  or null if it didn't cross any threshold (a tap or a too-small drag). */
    fun onDragEnd(): TouchAction? {
        dragging = false
        val absX = kotlin.math.abs(accumX)
        val absY = kotlin.math.abs(accumY)

        // Vertical swipe (swipe up = jump) takes priority when it's the dominant axis.
        if (absY > absX && absY >= verticalSwipeThresholdPx && accumY < 0) {
            return TouchAction.Jump
        }
        // Horizontal swipe must clearly dominate the vertical component so a diagonal
        // gesture never triggers an unintended lane change.
        if (absX > absY && absX >= horizontalSwipeThresholdPx) {
            return if (accumX < 0) TouchAction.MoveLeft else TouchAction.MoveRight
        }
        return null
    }

    fun onTap(xFractionOfWidth: Float): TouchAction = when {
        xFractionOfWidth < 0.33f -> TouchAction.MoveLeft
        xFractionOfWidth > 0.66f -> TouchAction.MoveRight
        else -> TouchAction.Jump
    }
}
