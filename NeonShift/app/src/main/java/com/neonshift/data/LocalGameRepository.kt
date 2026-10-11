package com.neonshift.data

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

private val Context.dataStore by preferencesDataStore(name = "neonshift_prefs")

data class LocalRecord(
    val runId: String,
    val gamerTag: String,
    val score: Int,
    val distanceMeters: Int,
    val shardsCollected: Int,
    val nearMisses: Int,
    val maxCombo: Float,
    val timestampMillis: Long
)

/**
 * Local persistence for best score/distance, gamer tag, settings, and a bounded
 * local leaderboard. Corrupted or missing preference data fails safe to defaults
 * rather than crashing — matches the spec's "handle corrupted data safely" requirement.
 */
class LocalGameRepository(private val context: Context) {

    private object Keys {
        val BEST_SCORE = intPreferencesKey("best_score")
        val BEST_DISTANCE = intPreferencesKey("best_distance")
        val GAMER_TAG = stringPreferencesKey("gamer_tag")
        val LOCAL_RECORDS_JSON = stringPreferencesKey("local_records_json")
        val MUSIC_ENABLED = stringPreferencesKey("music_enabled")
        val SFX_ENABLED = stringPreferencesKey("sfx_enabled")
        val HAPTICS_ENABLED = stringPreferencesKey("haptics_enabled")
    }

    val bestScore: Flow<Int> = context.dataStore.data
        .catch { emit(androidx.datastore.preferences.core.emptyPreferences()) }
        .map { it[Keys.BEST_SCORE] ?: 0 }

    val bestDistance: Flow<Int> = context.dataStore.data
        .catch { emit(androidx.datastore.preferences.core.emptyPreferences()) }
        .map { it[Keys.BEST_DISTANCE] ?: 0 }

    val gamerTag: Flow<String> = context.dataStore.data
        .catch { emit(androidx.datastore.preferences.core.emptyPreferences()) }
        .map { it[Keys.GAMER_TAG]?.takeIf(String::isNotBlank) ?: "PLAYER" }

    suspend fun setGamerTag(tag: String) {
        val safe = tag.trim().take(16).ifBlank { "PLAYER" }
        context.dataStore.edit { it[Keys.GAMER_TAG] = safe }
    }

    /** Saves a finished run: updates bests if beaten, and appends to the local leaderboard
     *  (kept bounded to the top 25 by score). */
    suspend fun saveRun(record: LocalRecord) {
        context.dataStore.edit { prefs ->
            val currentBestScore = prefs[Keys.BEST_SCORE] ?: 0
            val currentBestDistance = prefs[Keys.BEST_DISTANCE] ?: 0
            if (record.score > currentBestScore) prefs[Keys.BEST_SCORE] = record.score
            if (record.distanceMeters > currentBestDistance) prefs[Keys.BEST_DISTANCE] = record.distanceMeters

            val existing = parseRecords(prefs[Keys.LOCAL_RECORDS_JSON])
            val updated = (existing + record)
                .sortedByDescending { it.score }
                .take(25)
            prefs[Keys.LOCAL_RECORDS_JSON] = serializeRecords(updated)
        }
    }

    suspend fun localLeaderboard(): List<LocalRecord> {
        val prefs = context.dataStore.data.first()
        return parseRecords(prefs[Keys.LOCAL_RECORDS_JSON])
    }

    fun newRunId(): String = UUID.randomUUID().toString()

    private fun parseRecords(json: String?): List<LocalRecord> {
        if (json.isNullOrBlank()) return emptyList()
        return try {
            val arr = JSONArray(json)
            (0 until arr.length()).mapNotNull { i ->
                val o = arr.optJSONObject(i) ?: return@mapNotNull null
                LocalRecord(
                    runId = o.optString("runId", UUID.randomUUID().toString()),
                    gamerTag = o.optString("gamerTag", "PLAYER"),
                    score = o.optInt("score", 0),
                    distanceMeters = o.optInt("distanceMeters", 0),
                    shardsCollected = o.optInt("shardsCollected", 0),
                    nearMisses = o.optInt("nearMisses", 0),
                    maxCombo = o.optDouble("maxCombo", 1.0).toFloat(),
                    timestampMillis = o.optLong("timestampMillis", 0L)
                )
            }
        } catch (e: Exception) {
            // Corrupted data: fail safe rather than crash.
            emptyList()
        }
    }

    private fun serializeRecords(records: List<LocalRecord>): String {
        val arr = JSONArray()
        records.forEach { r ->
            val o = JSONObject()
            o.put("runId", r.runId)
            o.put("gamerTag", r.gamerTag)
            o.put("score", r.score)
            o.put("distanceMeters", r.distanceMeters)
            o.put("shardsCollected", r.shardsCollected)
            o.put("nearMisses", r.nearMisses)
            o.put("maxCombo", r.maxCombo.toDouble())
            o.put("timestampMillis", r.timestampMillis)
            arr.put(o)
        }
        return arr.toString()
    }
}
