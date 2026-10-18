export type BrickType = 
  | 'normal'      // 1 hit
  | 'tough'       // 2 hits
  | 'hardened'    // 3 hits
  | 'unbreakable' // Indestructible
  | 'tnt'         // Explodes 3x3 surrounding
  | 'powerup'     // Guaranteed powerup drop
  | 'bumper'      // Pinball bumper: high impulse rebound + points
  | 'glitch'      // Quantum glitch brick: periodic phasing
  | 'regen'       // Nanite brick: self-repairs if not finished
  | 'moving';     // Patrol brick: slides horizontally

export type PowerUpType = 
  | 'multiball'   // Multiplies active balls by 3
  | 'laser'       // Adds twin lasers to paddle (fire with space or click)
  | 'fireball'    // Penetrates and burns through bricks
  | 'expand'      // Wider paddle
  | 'sticky'      // Catches ball on paddle until launch
  | 'barrier'     // Bottom energy shield that reflects fallen balls
  | 'slow'        // Slows down ball speed for precision
  | 'life'        // +1 extra life
  | 'megaball';   // Giant plasma ball with doubled hit area

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickType;
  maxHp: number;
  hp: number;
  color: string;
  points: number;
  powerUp?: PowerUpType;
  // Dynamic behavior properties
  vx?: number;
  minX?: number;
  maxX?: number;
  regenTimer?: number;
  phaseTimer?: number;
  isPhasedOut?: boolean;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  isStuckToPaddle?: boolean;
  stuckOffsetX?: number; // relative to paddle center
  isFireball?: boolean;
  isMegaBall?: boolean;
  trail: { x: number; y: number; alpha: number }[];
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
  speed: number;
  tilt: number;
  isLaserActive: boolean;
  laserAmmo: number;
  isSticky: boolean;
}

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  type: PowerUpType;
  color: string;
  symbol: string;
  label: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  life: number;
  glow?: boolean;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

export interface LaserBolt {
  id: string;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  lives: number;
  levelIndex: number;
  combo: number;
  maxCombo: number;
  bricksBroken: number;
  ballsLaunched: number;
  isFeverActive?: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover' | 'levelwin' | 'victory';

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  author?: string;
  cols: number;
  rows: number;
  grid: (BrickType | null)[][];
  theme?: 'cyan' | 'matrix' | 'inferno' | 'galaxy' | 'boss';
  bossName?: string;
}
