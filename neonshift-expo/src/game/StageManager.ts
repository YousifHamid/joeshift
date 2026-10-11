export interface StageInfo {
  stage: number;
  stageStartMeters: number;
  stageTargetMeters: number;
  stageLengthMeters: number;
  progressPct: number;
  isMaxStage: boolean;
}

export class StageManager {
  public static readonly MAX_STAGES = 100;

  /**
   * Length in meters of a specific stage (1 to 100).
   * Stage 1: 1000m
   * Stage 2: 1500m
   * Stage 3: 1800m
   * Subsequent stages scale progressively up to a max cap.
   */
  public static getStageLength(stageNumber: number): number {
    if (stageNumber <= 1) return 1000;
    if (stageNumber === 2) return 1500;
    if (stageNumber === 3) return 1800;
    return Math.min(3600, 1800 + (stageNumber - 3) * 120);
  }

  /**
   * Precomputed cumulative distance thresholds for all 100 stages.
   * thresholds[0] = 0
   * thresholds[1] = 1000 (end of stage 1)
   * thresholds[2] = 2500 (end of stage 2)
   * thresholds[3] = 4300 (end of stage 3)
   */
  private static cachedThresholds: number[] | null = null;

  public static getThresholds(): number[] {
    if (!this.cachedThresholds) {
      const thresholds: number[] = [0];
      let cumulative = 0;
      for (let s = 1; s <= this.MAX_STAGES; s++) {
        cumulative += this.getStageLength(s);
        thresholds.push(cumulative);
      }
      this.cachedThresholds = thresholds;
    }
    return this.cachedThresholds;
  }

  /**
   * Returns complete telemetry and progress for the current distance.
   */
  public static getStageInfo(distanceMeters: number): StageInfo {
    const thresholds = this.getThresholds();
    const clampedDist = Math.max(0, distanceMeters);

    for (let s = 1; s <= this.MAX_STAGES; s++) {
      const stageStart = thresholds[s - 1];
      const stageTarget = thresholds[s];
      const stageLength = stageTarget - stageStart;

      if (clampedDist < stageTarget || s === this.MAX_STAGES) {
        const distInStage = Math.max(0, clampedDist - stageStart);
        const progressPct = Math.min(1.0, distInStage / stageLength);
        return {
          stage: s,
          stageStartMeters: stageStart,
          stageTargetMeters: stageTarget,
          stageLengthMeters: stageLength,
          progressPct,
          isMaxStage: s === this.MAX_STAGES,
        };
      }
    }

    const lastLength = this.getStageLength(this.MAX_STAGES);
    const lastTarget = thresholds[this.MAX_STAGES];
    return {
      stage: this.MAX_STAGES,
      stageStartMeters: lastTarget - lastLength,
      stageTargetMeters: lastTarget,
      stageLengthMeters: lastLength,
      progressPct: 1.0,
      isMaxStage: true,
    };
  }
}
