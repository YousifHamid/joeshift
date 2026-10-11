export type SkinId =
  | 'CYBER_CYAN'
  | 'SOLAR_GOLD'
  | 'CRIMSON_FURY'
  | 'VOID_PHANTOM'
  | 'EMERALD_VIPER';

export interface SkinPalette {
  wingColor: [number, number, number, number];
  armorColor: [number, number, number, number];
  finColor: [number, number, number, number];
  finAccentColor: [number, number, number, number];
  visorColor: [number, number, number, number];
  visorGlowColor: [number, number, number, number];
  engineRingColor: [number, number, number, number];
  jetOuterColor: [number, number, number, number];
  jetCoreColor: [number, number, number, number];
  wakeColor: [number, number, number, number];
}

export interface VehicleSkin {
  id: SkinId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  accentHex: string;
  costCredits: number;
  unlockedByDefault?: boolean;
  unlockWithShare?: boolean;
  palette: SkinPalette;
}

export const VEHICLE_SKINS: Record<SkinId, VehicleSkin> = {
  CYBER_CYAN: {
    id: 'CYBER_CYAN',
    name: 'AERO CYAN',
    tagline: 'STANDARD TACTICAL INTERCEPTOR',
    description: 'Military-grade cyber runner tuned for high-frequency grid shifting and agility.',
    badge: 'DEFAULT',
    accentHex: '#00F0FF',
    costCredits: 0,
    unlockedByDefault: true,
    palette: {
      wingColor: [0.0, 0.85, 0.95, 0.92],
      armorColor: [0.08, 0.12, 0.24, 0.98],
      finColor: [0.0, 0.96, 1.0, 1.0],
      finAccentColor: [1.0, 0.0, 0.9, 1.0],
      visorColor: [0.85, 1.0, 1.0, 1.0],
      visorGlowColor: [0.0, 0.96, 1.0, 0.85],
      engineRingColor: [0.75, 0.1, 0.9, 1.0],
      jetOuterColor: [0.0, 0.85, 1.0, 0.85],
      jetCoreColor: [1.0, 1.0, 1.0, 1.0],
      wakeColor: [0.0, 0.9, 1.0, 0.3],
    },
  },
  SOLAR_GOLD: {
    id: 'SOLAR_GOLD',
    name: 'SOLAR PHOENIX',
    tagline: 'PRESTIGE FRIEND REWARD',
    description: 'Exclusive gilded stealth craft awarded to pilots who recruit friends and share JOESHIFT.',
    badge: 'SHARE REWARD',
    accentHex: '#FFD700',
    costCredits: 500,
    unlockWithShare: true,
    palette: {
      wingColor: [1.0, 0.84, 0.0, 0.95],
      armorColor: [0.24, 0.18, 0.05, 0.98],
      finColor: [1.0, 0.95, 0.4, 1.0],
      finAccentColor: [1.0, 0.45, 0.0, 1.0],
      visorColor: [1.0, 0.98, 0.85, 1.0],
      visorGlowColor: [1.0, 0.84, 0.0, 0.9],
      engineRingColor: [1.0, 0.6, 0.0, 1.0],
      jetOuterColor: [1.0, 0.78, 0.1, 0.95],
      jetCoreColor: [1.0, 1.0, 0.9, 1.0],
      wakeColor: [1.0, 0.84, 0.0, 0.35],
    },
  },
  CRIMSON_FURY: {
    id: 'CRIMSON_FURY',
    name: 'CRIMSON FURY',
    tagline: 'HYPER-VOLCANIC OVERDRIVE',
    description: 'High-temperature carbon weave engineered for relentless aggression through hazard barriers.',
    badge: 'ELITE',
    accentHex: '#FF2965',
    costCredits: 600,
    palette: {
      wingColor: [1.0, 0.12, 0.28, 0.95],
      armorColor: [0.22, 0.04, 0.08, 0.98],
      finColor: [1.0, 0.35, 0.45, 1.0],
      finAccentColor: [1.0, 0.65, 0.1, 1.0],
      visorColor: [1.0, 0.88, 0.88, 1.0],
      visorGlowColor: [1.0, 0.15, 0.3, 0.9],
      engineRingColor: [1.0, 0.2, 0.1, 1.0],
      jetOuterColor: [1.0, 0.25, 0.05, 0.95],
      jetCoreColor: [1.0, 0.9, 0.8, 1.0],
      wakeColor: [1.0, 0.16, 0.4, 0.35],
    },
  },
  VOID_PHANTOM: {
    id: 'VOID_PHANTOM',
    name: 'VOID PHANTOM',
    tagline: 'ULTRAVIOLET DARK MATTER',
    description: 'Experimental dark matter hull with quantum stealth shielding and plasma thrusters.',
    badge: 'LEGENDARY',
    accentHex: '#9D00FF',
    costCredits: 1000,
    palette: {
      wingColor: [0.62, 0.12, 0.96, 0.95],
      armorColor: [0.12, 0.04, 0.2, 0.98],
      finColor: [0.85, 0.35, 1.0, 1.0],
      finAccentColor: [0.4, 0.9, 1.0, 1.0],
      visorColor: [0.94, 0.85, 1.0, 1.0],
      visorGlowColor: [0.75, 0.15, 1.0, 0.9],
      engineRingColor: [0.8, 0.2, 1.0, 1.0],
      jetOuterColor: [0.7, 0.15, 0.95, 0.95],
      jetCoreColor: [0.95, 0.8, 1.0, 1.0],
      wakeColor: [0.65, 0.1, 0.95, 0.35],
    },
  },
  EMERALD_VIPER: {
    id: 'EMERALD_VIPER',
    name: 'EMERALD VIPER',
    tagline: 'TOXIC CYBER VENOM',
    description: 'Supercharged ion matrix with bio-luminescent conduits and reactive plasma fins.',
    badge: 'RARE',
    accentHex: '#00FF66',
    costCredits: 750,
    palette: {
      wingColor: [0.0, 0.92, 0.42, 0.95],
      armorColor: [0.03, 0.18, 0.09, 0.98],
      finColor: [0.35, 1.0, 0.65, 1.0],
      finAccentColor: [0.0, 0.8, 1.0, 1.0],
      visorColor: [0.85, 1.0, 0.9, 1.0],
      visorGlowColor: [0.0, 1.0, 0.5, 0.9],
      engineRingColor: [0.0, 1.0, 0.4, 1.0],
      jetOuterColor: [0.0, 0.95, 0.4, 0.95],
      jetCoreColor: [0.8, 1.0, 0.9, 1.0],
      wakeColor: [0.0, 0.95, 0.4, 0.35],
    },
  },
};

export const DEFAULT_SKIN_ID: SkinId = 'CYBER_CYAN';
