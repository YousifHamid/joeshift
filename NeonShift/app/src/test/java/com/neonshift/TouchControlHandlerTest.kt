package com.neonshift

import com.neonshift.player.TouchAction
import com.neonshift.player.TouchControlHandler
import org.junit.Assert.*
import org.junit.Test

class TouchControlHandlerTest {

    @Test
    fun `swipe right above threshold produces MoveRight`() {
        val handler = TouchControlHandler(horizontalSwipeThresholdPx = 60f, verticalSwipeThresholdPx = 60f)
        handler.onDragStart(0f, 0f)
        handler.onDrag(80f, 2f)
        assertEquals(TouchAction.MoveRight, handler.onDragEnd())
    }

    @Test
    fun `swipe left above threshold produces MoveLeft`() {
        val handler = TouchControlHandler(horizontalSwipeThresholdPx = 60f, verticalSwipeThresholdPx = 60f)
        handler.onDragStart(0f, 0f)
        handler.onDrag(-80f, 2f)
        assertEquals(TouchAction.MoveLeft, handler.onDragEnd())
    }

    @Test
    fun `swipe up above threshold produces Jump`() {
        val handler = TouchControlHandler(horizontalSwipeThresholdPx = 60f, verticalSwipeThresholdPx = 60f)
        handler.onDragStart(0f, 0f)
        handler.onDrag(2f, -90f)
        assertEquals(TouchAction.Jump, handler.onDragEnd())
    }

    @Test
    fun `small movement below threshold produces no action`() {
        val handler = TouchControlHandler(horizontalSwipeThresholdPx = 60f, verticalSwipeThresholdPx = 60f)
        handler.onDragStart(0f, 0f)
        handler.onDrag(10f, 5f)
        assertNull(handler.onDragEnd())
    }

    @Test
    fun `diagonal gesture dominated by vertical does not trigger lane change`() {
        val handler = TouchControlHandler(horizontalSwipeThresholdPx = 60f, verticalSwipeThresholdPx = 60f)
        handler.onDragStart(0f, 0f)
        handler.onDrag(30f, -100f) // vertical dominates
        val action = handler.onDragEnd()
        assertEquals(TouchAction.Jump, action)
        assertNotEquals(TouchAction.MoveRight, action)
    }

    @Test
    fun `diagonal gesture dominated by horizontal does not trigger jump`() {
        val handler = TouchControlHandler(horizontalSwipeThresholdPx = 60f, verticalSwipeThresholdPx = 60f)
        handler.onDragStart(0f, 0f)
        handler.onDrag(100f, -30f) // horizontal dominates
        val action = handler.onDragEnd()
        assertEquals(TouchAction.MoveRight, action)
        assertNotEquals(TouchAction.Jump, action)
    }

    @Test
    fun `tap zones map to left move, jump, right move`() {
        val handler = TouchControlHandler()
        assertEquals(TouchAction.MoveLeft, handler.onTap(0.1f))
        assertEquals(TouchAction.Jump, handler.onTap(0.5f))
        assertEquals(TouchAction.MoveRight, handler.onTap(0.9f))
    }
}
