export enum PowerUpType {
  PHASE_SHIELD = 'PHASE_SHIELD',
  CHRONO_WARP = 'CHRONO_WARP',
  OVERDRIVE = 'OVERDRIVE',
  ENERGY_MAGNET = 'ENERGY_MAGNET',
}

export const PowerUpDisplayNames: Record<PowerUpType, string> = {
  [PowerUpType.PHASE_SHIELD]: 'PHASE SHIELD',
  [PowerUpType.CHRONO_WARP]: 'CHRONO WARP',
  [PowerUpType.OVERDRIVE]: '2X OVERDRIVE',
  [PowerUpType.ENERGY_MAGNET]: 'ENERGY MAGNET',
};

export interface PowerUpPickup {
  id: string;
  type: PowerUpType;
  z: number;
  lane: number;
  collected?: boolean;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remainingSeconds: number;
  totalDuration: number;
}
