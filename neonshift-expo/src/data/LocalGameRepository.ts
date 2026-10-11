import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SKIN_ID, SkinId } from '../game/VehicleSkins';

export interface LocalRecord {
  runId: string;
  gamerTag: string;
  score: number;
  distanceMeters: number;
  shardsCollected: number;
  nearMisses: number;
  maxCombo: number;
  timestampMillis: number;
}

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  hapticsEnabled: boolean;
  controlScheme: 'gestures' | 'buttons' | 'hybrid';
}

const STORAGE_KEYS = {
  BEST_SCORE: 'neonshift_best_score',
  BEST_DISTANCE: 'neonshift_best_distance',
  GAMER_TAG: 'neonshift_gamer_tag',
  LOCAL_RECORDS: 'neonshift_local_records',
  SETTINGS: 'neonshift_settings',
  CREDITS: 'neonshift_credits',
  UNLOCKED_SKINS: 'neonshift_unlocked_skins',
  EQUIPPED_SKIN: 'neonshift_equipped_skin',
  HEADSTART_NITRO: 'neonshift_headstart_nitro',
  SAVED_STAGE: 'neonshift_saved_stage',
  HIGHEST_STAGE: 'neonshift_highest_stage',
  INVITE_COUNT: 'neonshift_invite_count',
};

const DEFAULT_SETTINGS: GameSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  hapticsEnabled: true,
  controlScheme: 'hybrid',
};

export class LocalGameRepository {
  private static sanitizeGamerTag(tag: string): string {
    // Alphanumeric + underscores/dashes, 2..16 chars
    const cleaned = tag.replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 16);
    return cleaned.length > 0 ? cleaned.toUpperCase() : 'CYBER_RUNNER';
  }

  public static async getBestScore(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.BEST_SCORE);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  public static async getBestDistance(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.BEST_DISTANCE);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  public static async getGamerTag(): Promise<string> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.GAMER_TAG);
      return val ? this.sanitizeGamerTag(val) : 'CYBER_RUNNER';
    } catch {
      return 'CYBER_RUNNER';
    }
  }

  public static async setGamerTag(tag: string): Promise<string> {
    const safeTag = this.sanitizeGamerTag(tag);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GAMER_TAG, safeTag);
    } catch {}
    return safeTag;
  }

  public static async getSettings(): Promise<GameSettings> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (val) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(val) };
      }
    } catch {}
    return { ...DEFAULT_SETTINGS };
  }

  public static async saveSettings(settings: Partial<GameSettings>): Promise<GameSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  public static async getLeaderboard(): Promise<LocalRecord[]> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_RECORDS);
      if (!val) return [];
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 25);
      }
    } catch {
      // Fail safe on corrupted data
    }
    return [];
  }

  // --- Cyber Credits (In-Game Currency) ---
  public static async getCredits(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.CREDITS);
      return val ? parseInt(val, 10) || 0 : 150; // 150 starting credits for a welcoming onboarding
    } catch {
      return 150;
    }
  }

  public static async addCredits(amount: number): Promise<number> {
    try {
      const current = await this.getCredits();
      const updated = Math.max(0, current + amount);
      await AsyncStorage.setItem(STORAGE_KEYS.CREDITS, updated.toString());
      return updated;
    } catch {
      return 0;
    }
  }

  public static async spendCredits(amount: number): Promise<boolean> {
    try {
      const current = await this.getCredits();
      if (current >= amount) {
        await AsyncStorage.setItem(STORAGE_KEYS.CREDITS, (current - amount).toString());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // --- Vehicle Skins Management ---
  public static async getUnlockedSkins(): Promise<SkinId[]> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_SKINS);
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.includes('CYBER_CYAN')) parsed.unshift('CYBER_CYAN');
          return parsed as SkinId[];
        }
      }
    } catch {}
    return ['CYBER_CYAN'];
  }

  public static async unlockSkin(skinId: SkinId): Promise<SkinId[]> {
    try {
      const current = await this.getUnlockedSkins();
      if (!current.includes(skinId)) {
        const updated = [...current, skinId];
        await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_SKINS, JSON.stringify(updated));
        return updated;
      }
      return current;
    } catch {
      return ['CYBER_CYAN'];
    }
  }

  public static async getEquippedSkin(): Promise<SkinId> {
    try {
      const val = (await AsyncStorage.getItem(STORAGE_KEYS.EQUIPPED_SKIN)) as SkinId | null;
      if (val) return val;
    } catch {}
    return DEFAULT_SKIN_ID;
  }

  public static async setEquippedSkin(skinId: SkinId): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EQUIPPED_SKIN, skinId);
    } catch {}
  }

  // --- Temporary Nitro Perks ---
  public static async getHeadstartNitroPerk(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.HEADSTART_NITRO);
      return val === 'true';
    } catch {
      return false;
    }
  }

  public static async setHeadstartNitroPerk(active: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HEADSTART_NITRO, active ? 'true' : 'false');
    } catch {}
  }

  // --- Stage Progression & Persistence ---
  public static async getSavedStage(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_STAGE);
      return val ? Math.max(1, parseInt(val, 10) || 1) : 1;
    } catch {
      return 1;
    }
  }

  public static async getHighestStage(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.HIGHEST_STAGE);
      return val ? Math.max(1, parseInt(val, 10) || 1) : 1;
    } catch {
      return 1;
    }
  }

  public static async saveStageProgress(stage: number): Promise<{
    savedStage: number;
    highestStage: number;
  }> {
    const validStage = Math.max(1, Math.floor(stage));
    try {
      const currentHighest = await this.getHighestStage();
      const newHighest = Math.max(currentHighest, validStage);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_STAGE, validStage.toString());
      if (newHighest > currentHighest) {
        await AsyncStorage.setItem(STORAGE_KEYS.HIGHEST_STAGE, newHighest.toString());
      }
      return { savedStage: validStage, highestStage: newHighest };
    } catch {
      return { savedStage: validStage, highestStage: validStage };
    }
  }

  public static async resetStageProgress(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_STAGE, '1');
    } catch {}
  }

  // --- Invite & Referrals System ---
  public static async getShareCount(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.INVITE_COUNT);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Awards player for inviting friends or sharing:
   * 1. +500 Cyber Credits
   * 2. Unlocks exclusive 'SOLAR_GOLD' skin
   * 3. Grants Headstart Nitro Boost perk for the next run
   */
  public static async claimShareReward(): Promise<{
    creditsAwarded: number;
    newSkinUnlocked: boolean;
    headstartNitroAwarded: boolean;
    totalCredits: number;
  }> {
    const creditsAwarded = 500;
    const currentCredits = await this.addCredits(creditsAwarded);

    const unlocked = await this.getUnlockedSkins();
    const isGoldAlreadyUnlocked = unlocked.includes('SOLAR_GOLD');
    if (!isGoldAlreadyUnlocked) {
      await this.unlockSkin('SOLAR_GOLD');
    }

    // Always grant the temporary Headstart Nitro Boost perk for the next run
    await this.setHeadstartNitroPerk(true);

    try {
      const count = await this.getShareCount();
      await AsyncStorage.setItem(STORAGE_KEYS.INVITE_COUNT, (count + 1).toString());
    } catch {}

    return {
      creditsAwarded,
      newSkinUnlocked: !isGoldAlreadyUnlocked,
      headstartNitroAwarded: true,
      totalCredits: currentCredits,
    };
  }

  public static async saveRun(record: LocalRecord): Promise<{
    isNewBestScore: boolean;
    isNewBestDistance: boolean;
    creditsEarned: number;
  }> {
    try {
      const currentBestScore = await this.getBestScore();
      const currentBestDistance = await this.getBestDistance();

      const isNewBestScore = record.score > currentBestScore;
      const isNewBestDistance = record.distanceMeters > currentBestDistance;

      if (isNewBestScore) {
        await AsyncStorage.setItem(STORAGE_KEYS.BEST_SCORE, record.score.toString());
      }
      if (isNewBestDistance) {
        await AsyncStorage.setItem(STORAGE_KEYS.BEST_DISTANCE, record.distanceMeters.toString());
      }

      const existing = await this.getLeaderboard();
      const updated = [...existing, record]
        .sort((a, b) => b.score - a.score)
        .slice(0, 25);

      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_RECORDS, JSON.stringify(updated));

      // Calculate in-game currency earned from performance (shards + distance)
      const creditsEarned = Math.max(
        15,
        Math.floor(record.shardsCollected * 2 + record.distanceMeters / 40)
      );
      await this.addCredits(creditsEarned);

      return { isNewBestScore, isNewBestDistance, creditsEarned };
    } catch {
      return { isNewBestScore: false, isNewBestDistance: false, creditsEarned: 0 };
    }
  }

  public static generateRunId(): string {
    return 'run_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  }
}
