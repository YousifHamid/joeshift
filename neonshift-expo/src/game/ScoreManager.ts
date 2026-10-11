import { GameConfig } from './GameConfig';

export class ScoreManager {
  private _score: number = 0;
  private _comboMultiplier: number = 1.0;
  private _maxComboReached: number = 1.0;
  private _timeSinceLastEvent: number = 0;

  public get score(): number {
    return this._score;
  }

  public get comboMultiplier(): number {
    return this._comboMultiplier;
  }

  public get maxComboReached(): number {
    return this._maxComboReached;
  }

  public reset(): void {
    this._score = 0;
    this._comboMultiplier = 1.0;
    this._maxComboReached = 1.0;
    this._timeSinceLastEvent = 0;
  }

  public tick(
    dt: number,
    distanceDeltaMeters: number,
    shardEvents: number,
    nearMissEvents: number,
    overdriveActive: boolean
  ): void {
    this._timeSinceLastEvent += dt;
    if (this._timeSinceLastEvent >= GameConfig.COMBO_DECAY_S) {
      this._comboMultiplier = 1.0;
    }

    const totalScoringEvents = shardEvents + nearMissEvents;
    if (totalScoringEvents > 0) {
      for (let i = 0; i < totalScoringEvents; i++) {
        const next = Math.min(
          this._comboMultiplier + GameConfig.COMBO_STEP,
          GameConfig.COMBO_MAX
        );
        this._comboMultiplier = Math.round(next * 10) / 10;
      }
      this._timeSinceLastEvent = 0;
      this._maxComboReached = Math.max(this._maxComboReached, this._comboMultiplier);
    }

    const overdriveMult = overdriveActive ? GameConfig.OVERDRIVE_SCORE_MULTIPLIER : 1.0;
    const raw =
      distanceDeltaMeters * GameConfig.DISTANCE_SCORE_PER_METER +
      shardEvents * GameConfig.SHARD_SCORE +
      nearMissEvents * GameConfig.NEAR_MISS_SCORE;

    this._score += Math.floor(raw * this._comboMultiplier * overdriveMult);
  }

  public addBonusScore(points: number): void {
    this._score += Math.max(0, Math.floor(points));
  }
}
