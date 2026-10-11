package com.neonshift.world

/**
 * Generic reusable-object pool to avoid per-frame allocation for obstacles,
 * collectibles, and power-ups, per the spec's performance requirements.
 */
class ObjectPool<T>(
    private val factory: () -> T,
    private val reset: (T) -> Unit,
    initialSize: Int = 16
) {
    private val available = ArrayDeque<T>().apply {
        repeat(initialSize) { add(factory()) }
    }

    fun obtain(): T = if (available.isEmpty()) factory() else available.removeLast()

    fun recycle(item: T) {
        reset(item)
        available.addLast(item)
    }
}
