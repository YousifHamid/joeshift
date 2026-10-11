package com.neonshift.data

/**
 * NOT_IMPLEMENTED: global leaderboard backend.
 *
 * A real global leaderboard needs a server that: authenticates players, validates
 * submitted scores against a server-side replay/heuristic check (never trusts the
 * client), rate-limits submissions, and stores rankings in a real database. None of
 * that exists yet — there is no deployed NeonShift backend.
 *
 * This class defines the real client contract that backend would be called through,
 * and does the part that IS honestly implementable client-side: queuing submissions
 * for later sync while offline, and never presenting local/mock data as if it were a
 * live global rank. Wire `apiBaseUrl` to a real deployed endpoint when one exists.
 */
class LeaderboardRepository(
    private val apiBaseUrl: String? = null // null = no backend configured yet
) {
    data class SubmissionResult(val success: Boolean, val queued: Boolean, val message: String)
    data class GlobalRankEntry(val rank: Int, val gamerTag: String, val score: Int)

    private val offlineQueue = mutableListOf<LocalRecord>()

    val isBackendConfigured: Boolean get() = !apiBaseUrl.isNullOrBlank()

    /** Attempts to submit a run. If no backend is configured, or the device is offline,
     *  the run is queued for later sync — it is never silently dropped or faked. */
    suspend fun submit(record: LocalRecord): SubmissionResult {
        if (!isBackendConfigured) {
            offlineQueue.add(record)
            return SubmissionResult(
                success = false,
                queued = true,
                message = "NOT_IMPLEMENTED: no global leaderboard backend is deployed. Run queued locally."
            )
        }
        // Real implementation once a backend exists: POST to apiBaseUrl with the record,
        // handle auth, retry on failure, and only clear from offlineQueue on 2xx.
        return SubmissionResult(false, queued = true, message = "NOT_IMPLEMENTED: submission networking not wired up.")
    }

    /** Global rankings require a real backend. Returns an empty, clearly-labeled result
     *  rather than fabricating ranking data. */
    suspend fun fetchGlobalTop(limit: Int = 50): List<GlobalRankEntry> {
        if (!isBackendConfigured) return emptyList()
        return emptyList() // NOT_IMPLEMENTED
    }

    fun pendingOfflineCount(): Int = offlineQueue.size
}
