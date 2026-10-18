import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Ball, 
  Brick, 
  FloatingText, 
  GameStats, 
  GameStatus, 
  LaserBolt, 
  LevelConfig, 
  Paddle, 
  Particle, 
  PowerUpItem, 
  PowerUpType 
} from '../types/game';
import { sound } from '../utils/audio';
import { BRICK_COLORS, createBricksFromConfig, POWER_UP_CONFIG } from './levels';

interface GameCanvasProps {
  currentLevel: LevelConfig;
  onStatsUpdate: (stats: GameStats) => void;
  onLevelComplete: () => void;
  onGameOver: (finalScore: number) => void;
  onGameWin: (finalScore: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestartLevel: () => void;
}

const CANVAS_WIDTH = 840;
const CANVAS_HEIGHT = 620;
const PADDLE_DEFAULT_WIDTH = 110;
const PADDLE_EXPANDED_WIDTH = 165;
const PADDLE_HEIGHT = 16;
const BALL_BASE_SPEED = 6.4;
const BALL_RADIUS = 7;
const MEGA_BALL_RADIUS = 13;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentLevel,
  onStatsUpdate,
  onLevelComplete,
  onGameOver,
  isPaused,
  onTogglePause,
  onRestartLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level React states for active power-up timers display
  const [activeEffects, setActiveEffects] = useState<{
    laser: number;
    fireball: number;
    expand: number;
    sticky: number;
    slow: number;
    megaball: number;
    barrierHits: number;
    isFever: boolean;
  }>({
    laser: 0,
    fireball: 0,
    expand: 0,
    sticky: 0,
    slow: 0,
    megaball: 0,
    barrierHits: 0,
    isFever: false,
  });

  // Game state held in refs for 60fps stutter-free requestAnimationFrame loop
  const gameStateRef = useRef<{
    status: GameStatus;
    score: number;
    lives: number;
    combo: number;
    maxCombo: number;
    comboTimer: number;
    bricksBroken: number;
    ballsLaunched: number;
    feverActive: boolean;
    paddle: Paddle;
    balls: Ball[];
    bricks: Brick[];
    powerUps: PowerUpItem[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    lasers: LaserBolt[];
    shakeTime: number;
    shakeMagnitude: number;
    barrierHits: number;
    fireballTimer: number;
    laserTimer: number;
    expandTimer: number;
    stickyTimer: number;
    slowTimer: number;
    megaBallTimer: number;
    keys: { left: boolean; right: boolean; space: boolean };
    mousePos: { x: number; active: boolean };
    lastTime: number;
    totalDestructibles: number;
    destroyedDestructibles: number;
  }>({
    status: 'idle',
    score: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    bricksBroken: 0,
    ballsLaunched: 0,
    feverActive: false,
    paddle: {
      x: CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2,
      y: CANVAS_HEIGHT - 38,
      width: PADDLE_DEFAULT_WIDTH,
      height: PADDLE_HEIGHT,
      targetX: CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2,
      speed: 12,
      tilt: 0,
      isLaserActive: false,
      laserAmmo: 0,
      isSticky: false,
    },
    balls: [],
    bricks: [],
    powerUps: [],
    particles: [],
    floatingTexts: [],
    lasers: [],
    shakeTime: 0,
    shakeMagnitude: 0,
    barrierHits: 0,
    fireballTimer: 0,
    laserTimer: 0,
    expandTimer: 0,
    stickyTimer: 0,
    slowTimer: 0,
    megaBallTimer: 0,
    keys: { left: false, right: false, space: false },
    mousePos: { x: CANVAS_WIDTH / 2, active: false },
    lastTime: performance.now(),
    totalDestructibles: 1,
    destroyedDestructibles: 0,
  });

  // Spawn initial ball stuck to paddle
  const resetBallOnPaddle = useCallback(() => {
    const p = gameStateRef.current.paddle;
    const isMega = gameStateRef.current.megaBallTimer > 0;
    const r = isMega ? MEGA_BALL_RADIUS : BALL_RADIUS;

    gameStateRef.current.balls = [
      {
        id: `ball-${Date.now()}`,
        x: p.x + p.width / 2,
        y: p.y - r - 1,
        vx: 0,
        vy: -BALL_BASE_SPEED,
        radius: r,
        speed: BALL_BASE_SPEED,
        isStuckToPaddle: true,
        stuckOffsetX: 0,
        isFireball: gameStateRef.current.fireballTimer > 0,
        isMegaBall: isMega,
        trail: [],
      },
    ];
  }, []);

  // Initialize level
  const initLevel = useCallback(
    (resetScoreAndLives = false) => {
      const gs = gameStateRef.current;
      if (resetScoreAndLives) {
        gs.score = 0;
        gs.lives = 3;
        gs.combo = 0;
        gs.maxCombo = 0;
        gs.bricksBroken = 0;
        gs.ballsLaunched = 0;
      }

      gs.status = 'idle';
      gs.paddle.width = PADDLE_DEFAULT_WIDTH;
      gs.paddle.x = CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2;
      gs.paddle.targetX = gs.paddle.x;
      gs.paddle.isLaserActive = false;
      gs.paddle.isSticky = false;
      gs.paddle.laserAmmo = 0;

      const createdBricks = createBricksFromConfig(currentLevel, CANVAS_WIDTH, CANVAS_HEIGHT);
      gs.bricks = createdBricks;
      gs.totalDestructibles = createdBricks.filter((b) => b.type !== 'unbreakable').length;
      gs.destroyedDestructibles = 0;

      gs.powerUps = [];
      gs.particles = [];
      gs.floatingTexts = [];
      gs.lasers = [];
      gs.shakeTime = 0;
      gs.barrierHits = 0;
      gs.fireballTimer = 0;
      gs.laserTimer = 0;
      gs.expandTimer = 0;
      gs.stickyTimer = 0;
      gs.slowTimer = 0;
      gs.megaBallTimer = 0;
      gs.feverActive = false;

      resetBallOnPaddle();

      onStatsUpdate({
        score: gs.score,
        highScore: parseInt(localStorage.getItem('neon_breakout_highscore') || '0', 10),
        lives: gs.lives,
        levelIndex: 0,
        combo: gs.combo,
        maxCombo: gs.maxCombo,
        bricksBroken: gs.bricksBroken,
        ballsLaunched: gs.ballsLaunched,
        isFeverActive: false,
      });

      setActiveEffects({
        laser: 0,
        fireball: 0,
        expand: 0,
        sticky: 0,
        slow: 0,
        megaball: 0,
        barrierHits: 0,
        isFever: false,
      });
    },
    [currentLevel, resetBallOnPaddle, onStatsUpdate]
  );

  useEffect(() => {
    initLevel(false);
  }, [currentLevel, initLevel]);

  // Launch any ball stuck to paddle
  const launchStuckBalls = useCallback(() => {
    const gs = gameStateRef.current;
    let launched = false;
    gs.balls.forEach((b) => {
      if (b.isStuckToPaddle) {
        b.isStuckToPaddle = false;
        const offset = b.stuckOffsetX || 0;
        const normalizedOffset = offset / (gs.paddle.width / 2);
        const maxAngle = (Math.PI / 180) * 60;
        const angle = -Math.PI / 2 + normalizedOffset * maxAngle;
        const currentSpeed = gs.slowTimer > 0 ? BALL_BASE_SPEED * 0.72 : BALL_BASE_SPEED;
        b.vx = Math.sin(angle) * currentSpeed;
        b.vy = -Math.cos(angle) * currentSpeed;
        launched = true;
      }
    });

    if (launched) {
      gs.status = 'playing';
      gs.ballsLaunched += 1;
      sound.playPaddleHit(0);
    }
  }, []);

  // Fire laser bolts from paddle
  const fireLasers = useCallback(() => {
    const gs = gameStateRef.current;
    if (!gs.paddle.isLaserActive && gs.laserTimer <= 0) return;

    const p = gs.paddle;
    const laserY = p.y - 4;
    const boltLeft: LaserBolt = {
      id: `laser-${Date.now()}-1`,
      x: p.x + 10,
      y: laserY,
      vy: -15,
      width: 4,
      height: 16,
    };
    const boltRight: LaserBolt = {
      id: `laser-${Date.now()}-2`,
      x: p.x + p.width - 14,
      y: laserY,
      vy: -15,
      width: 4,
      height: 16,
    };
    gs.lasers.push(boltLeft, boltRight);

    for (let i = 0; i < 5; i++) {
      gs.particles.push({
        x: p.x + 10 + (Math.random() * 4 - 2),
        y: laserY,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3,
        color: '#f43f5e',
        size: 3,
        alpha: 1,
        decay: 0.08,
        life: 1,
      });
      gs.particles.push({
        x: p.x + p.width - 12 + (Math.random() * 4 - 2),
        y: laserY,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3,
        color: '#f43f5e',
        size: 3,
        alpha: 1,
        decay: 0.08,
        life: 1,
      });
    }

    sound.playLaserShoot();
  }, []);

  // Trigger floating text
  const addFloatingText = (x: number, y: number, text: string, color: string = '#38bdf8') => {
    gameStateRef.current.floatingTexts.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.3,
      scale: 1,
    });
  };

  // Add spark / debris explosion particles
  const addParticles = (
    x: number,
    y: number,
    color: string,
    count: number = 14,
    speedMultiplier: number = 1,
    glow: boolean = true
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 4 + 1.5) * speedMultiplier;
      gameStateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3.5 + 2,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.02,
        life: 1,
        glow,
      });
    }
  };

  // Apply powerup effect
  const applyPowerUp = (type: PowerUpType, x: number, y: number) => {
    const gs = gameStateRef.current;
    sound.playPowerUpCollect();
    const config = POWER_UP_CONFIG[type];
    addFloatingText(x, y - 10, `+${config.label}!`, config.color);
    addParticles(x, y, config.color, 24, 1.5, true);

    switch (type) {
      case 'multiball': {
        const newBalls: Ball[] = [];
        gs.balls.forEach((b) => {
          if (!b.isStuckToPaddle) {
            const angle1 = Math.atan2(b.vy, b.vx) - 0.45;
            const angle2 = Math.atan2(b.vy, b.vx) + 0.45;
            const spd = b.speed;
            newBalls.push(
              {
                id: `b-${Date.now()}-1`,
                x: b.x,
                y: b.y,
                vx: Math.cos(angle1) * spd,
                vy: Math.sin(angle1) * spd,
                radius: b.radius,
                speed: spd,
                isFireball: b.isFireball,
                isMegaBall: b.isMegaBall,
                trail: [],
              },
              {
                id: `b-${Date.now()}-2`,
                x: b.x,
                y: b.y,
                vx: Math.cos(angle2) * spd,
                vy: Math.sin(angle2) * spd,
                radius: b.radius,
                speed: spd,
                isFireball: b.isFireball,
                isMegaBall: b.isMegaBall,
                trail: [],
              }
            );
          }
        });
        if (newBalls.length === 0 && gs.balls.length > 0) {
          const p = gs.paddle;
          newBalls.push(
            {
              id: `b-${Date.now()}-1`,
              x: p.x + p.width * 0.25,
              y: p.y - 12,
              vx: -3.5,
              vy: -BALL_BASE_SPEED,
              radius: BALL_RADIUS,
              speed: BALL_BASE_SPEED,
              trail: [],
            },
            {
              id: `b-${Date.now()}-2`,
              x: p.x + p.width * 0.75,
              y: p.y - 12,
              vx: 3.5,
              vy: -BALL_BASE_SPEED,
              radius: BALL_RADIUS,
              speed: BALL_BASE_SPEED,
              trail: [],
            }
          );
        }
        gs.balls.push(...newBalls);
        break;
      }
      case 'megaball': {
        gs.megaBallTimer = 12;
        gs.balls.forEach((b) => {
          b.radius = MEGA_BALL_RADIUS;
          b.isMegaBall = true;
        });
        break;
      }
      case 'laser': {
        gs.laserTimer = 15;
        gs.paddle.isLaserActive = true;
        break;
      }
      case 'fireball': {
        gs.fireballTimer = 10;
        gs.balls.forEach((b) => (b.isFireball = true));
        break;
      }
      case 'expand': {
        gs.expandTimer = 16;
        gs.paddle.width = PADDLE_EXPANDED_WIDTH;
        break;
      }
      case 'sticky': {
        gs.stickyTimer = 14;
        gs.paddle.isSticky = true;
        break;
      }
      case 'barrier': {
        gs.barrierHits = 3;
        break;
      }
      case 'slow': {
        gs.slowTimer = 12;
        gs.balls.forEach((b) => {
          const currentSpd = Math.hypot(b.vx, b.vy);
          if (currentSpd > 0) {
            b.vx = (b.vx / currentSpd) * (BALL_BASE_SPEED * 0.7);
            b.vy = (b.vy / currentSpd) * (BALL_BASE_SPEED * 0.7);
          }
        });
        break;
      }
      case 'life': {
        gs.lives = Math.min(5, gs.lives + 1);
        addFloatingText(gs.paddle.x + gs.paddle.width / 2, gs.paddle.y - 30, '+1 LIFE!', '#ec4899');
        break;
      }
    }
  };

  // Explode TNT brick and cascade
  const explodeTNT = (tntBrick: Brick) => {
    const gs = gameStateRef.current;
    sound.playExplosion();
    gs.shakeTime = 16;
    gs.shakeMagnitude = 11;

    const centerX = tntBrick.x + tntBrick.width / 2;
    const centerY = tntBrick.y + tntBrick.height / 2;

    addParticles(centerX, centerY, '#ea580c', 45, 2.5, true);
    addParticles(centerX, centerY, '#facc15', 30, 2, true);
    addFloatingText(centerX, centerY, '💥 烈焰爆破!', '#f97316');

    const explosionRadius = 115;
    const adjacentBricks = gs.bricks.filter(
      (b) =>
        b.id !== tntBrick.id &&
        Math.hypot(b.x + b.width / 2 - centerX, b.y + b.height / 2 - centerY) < explosionRadius
    );

    adjacentBricks.forEach((b) => {
      if (b.type === 'unbreakable') return;
      b.hp = 0;
      const pts = b.points * 2 * (gs.feverActive ? 2 : 1);
      gs.score += pts;
      gs.bricksBroken += 1;
      gs.destroyedDestructibles += 1;
      addParticles(b.x + b.width / 2, b.y + b.height / 2, b.color, 12, 1.2);

      if (b.powerUp) {
        gs.powerUps.push({
          id: `pu-${Date.now()}-${Math.random()}`,
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          vy: 2.2,
          width: 32,
          height: 18,
          type: b.powerUp,
          color: POWER_UP_CONFIG[b.powerUp].color,
          symbol: POWER_UP_CONFIG[b.powerUp].symbol,
          label: POWER_UP_CONFIG[b.powerUp].label,
        });
      }
    });

    gs.bricks = gs.bricks.filter((b) => b.hp > 0 && b.id !== tntBrick.id);
  };

  // Hit brick handler
  const handleBrickHit = (brick: Brick, isFireball: boolean = false, isMega: boolean = false) => {
    const gs = gameStateRef.current;

    // Check intangible glitch brick
    if (brick.type === 'glitch' && brick.isPhasedOut) {
      return; // phases right through!
    }

    if (brick.type === 'unbreakable') {
      sound.playWallHit();
      addParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#94a3b8', 6, 0.8, false);
      return;
    }

    // Pinball Bumper
    if (brick.type === 'bumper') {
      sound.playBumperHit();
      gs.score += 150 * (gs.feverActive ? 2 : 1);
      addFloatingText(brick.x + brick.width / 2, brick.y - 12, '🌀 彈力加倍 +150', '#ec4899');
      addParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#ec4899', 16, 1.8, true);
      return;
    }

    if (brick.type === 'tnt') {
      explodeTNT(brick);
      return;
    }

    const damage = isFireball || isMega ? brick.hp : 1;
    brick.hp -= damage;
    brick.regenTimer = 0; // reset nanite regen timer when damaged

    if (brick.hp <= 0) {
      gs.bricksBroken += 1;
      gs.destroyedDestructibles += 1;
      gs.combo += 1;
      gs.comboTimer = 2.4;
      if (gs.combo > gs.maxCombo) gs.maxCombo = gs.combo;

      // Check Fever Mode trigger
      if (gs.combo >= 5 && !gs.feverActive) {
        gs.feverActive = true;
        sound.playFeverMode();
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30, '⚡ FEVER MODE 狂熱時間 x2倍得分!', '#facc15');
      }

      const feverMult = gs.feverActive ? 2 : 1;
      const comboMultiplier = (1 + (gs.combo - 1) * 0.25) * feverMult;
      const pts = Math.round(brick.points * comboMultiplier);
      gs.score += pts;

      sound.playBrickDestroy(gs.combo);
      addParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 18, 1.4);

      if (gs.combo >= 3) {
        addFloatingText(
          brick.x + brick.width / 2,
          brick.y - 12,
          `+${pts} (${gs.combo} 連擊${gs.feverActive ? ' · FEVER!' : ''})`,
          gs.feverActive ? '#facc15' : '#38bdf8'
        );
      } else {
        addFloatingText(brick.x + brick.width / 2, brick.y - 10, `+${pts}`, '#38bdf8');
      }

      if (brick.powerUp) {
        gs.powerUps.push({
          id: `pu-${Date.now()}-${Math.random()}`,
          x: brick.x + brick.width / 2,
          y: brick.y + brick.height / 2,
          vy: 2.1,
          width: 32,
          height: 18,
          type: brick.powerUp,
          color: POWER_UP_CONFIG[brick.powerUp].color,
          symbol: POWER_UP_CONFIG[brick.powerUp].symbol,
          label: POWER_UP_CONFIG[brick.powerUp].label,
        });
      }

      gs.bricks = gs.bricks.filter((b) => b.id !== brick.id);
    } else {
      sound.playBrickDamage();
      addParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 8, 0.8);
      addFloatingText(brick.x + brick.width / 2, brick.y - 6, `-1`, '#cbd5e1');
    }
  };

  // Main update loop
  const updateGame = (dt: number) => {
    const gs = gameStateRef.current;
    if (gs.status === 'paused' || isPaused) return;

    if (gs.shakeTime > 0) gs.shakeTime -= 1;

    // Combo timer decay & Fever mode expiration
    if (gs.comboTimer > 0) {
      gs.comboTimer -= dt;
      if (gs.comboTimer <= 0) {
        gs.combo = 0;
        gs.feverActive = false;
      }
    }

    // Dynamic Bricks: Moving Patrols & Glitch phasing & Nanite Regen
    gs.bricks.forEach((b) => {
      // Moving patrol brick
      if (b.type === 'moving' && b.vx) {
        b.x += b.vx;
        if (b.minX && b.x <= b.minX) {
          b.x = b.minX;
          b.vx = Math.abs(b.vx);
        } else if (b.maxX && b.x >= b.maxX) {
          b.x = b.maxX;
          b.vx = -Math.abs(b.vx);
        }
      }

      // Quantum glitch phasing
      if (b.type === 'glitch') {
        b.phaseTimer = (b.phaseTimer || 0) + dt;
        // Periodically cycle solid for 2.5s, phased out for 1.2s
        const cycle = b.phaseTimer % 3.7;
        b.isPhasedOut = cycle > 2.5;
      }

      // Nanite Regen brick
      if (b.type === 'regen' && b.hp < b.maxHp) {
        b.regenTimer = (b.regenTimer || 0) + dt;
        if (b.regenTimer >= 4.5) {
          b.hp = Math.min(b.maxHp, b.hp + 1);
          b.regenTimer = 0;
          addFloatingText(b.x + b.width / 2, b.y - 12, '🧪 奈米修復 +1', '#84cc16');
          addParticles(b.x + b.width / 2, b.y + b.height / 2, '#84cc16', 10, 1.0, true);
        }
      }
    });

    // Timed power-up decays
    if (gs.fireballTimer > 0) {
      gs.fireballTimer -= dt;
      if (gs.fireballTimer <= 0) {
        gs.balls.forEach((b) => (b.isFireball = false));
      }
    }

    if (gs.megaBallTimer > 0) {
      gs.megaBallTimer -= dt;
      if (gs.megaBallTimer <= 0) {
        gs.balls.forEach((b) => {
          b.radius = BALL_RADIUS;
          b.isMegaBall = false;
        });
      }
    }

    if (gs.laserTimer > 0) {
      gs.laserTimer -= dt;
      if (gs.laserTimer <= 0) {
        gs.paddle.isLaserActive = false;
      }
    }

    if (gs.expandTimer > 0) {
      gs.expandTimer -= dt;
      if (gs.expandTimer <= 0) {
        gs.paddle.width = PADDLE_DEFAULT_WIDTH;
      }
    }

    if (gs.stickyTimer > 0) {
      gs.stickyTimer -= dt;
      if (gs.stickyTimer <= 0) {
        gs.paddle.isSticky = false;
        launchStuckBalls();
      }
    }

    if (gs.slowTimer > 0) {
      gs.slowTimer -= dt;
      if (gs.slowTimer <= 0) {
        gs.balls.forEach((b) => {
          const spd = Math.hypot(b.vx, b.vy);
          if (spd > 0) {
            b.vx = (b.vx / spd) * BALL_BASE_SPEED;
            b.vy = (b.vy / spd) * BALL_BASE_SPEED;
          }
        });
      }
    }

    // Update paddle position
    const p = gs.paddle;
    let target = p.targetX;

    if (gs.keys.left) {
      target = p.x - p.speed * 1.3;
    } else if (gs.keys.right) {
      target = p.x + p.speed * 1.3;
    } else if (gs.mousePos.active) {
      target = gs.mousePos.x - p.width / 2;
    }

    target = Math.max(10, Math.min(CANVAS_WIDTH - p.width - 10, target));
    const prevX = p.x;
    p.x += (target - p.x) * 0.35;
    p.tilt = (p.x - prevX) * 0.15;

    // Update stuck balls
    gs.balls.forEach((b) => {
      if (b.isStuckToPaddle) {
        b.x = p.x + p.width / 2 + (b.stuckOffsetX || 0);
        b.y = p.y - b.radius - 1;
      }
    });

    // Update lasers
    for (let i = gs.lasers.length - 1; i >= 0; i--) {
      const laser = gs.lasers[i];
      laser.y += laser.vy;

      let hit = false;
      for (let j = gs.bricks.length - 1; j >= 0; j--) {
        const brick = gs.bricks[j];
        if (
          laser.x >= brick.x &&
          laser.x <= brick.x + brick.width &&
          laser.y >= brick.y &&
          laser.y <= brick.y + brick.height
        ) {
          hit = true;
          handleBrickHit(brick, false, false);
          break;
        }
      }

      if (hit || laser.y < -20) {
        gs.lasers.splice(i, 1);
      }
    }

    // Update power up items
    for (let i = gs.powerUps.length - 1; i >= 0; i--) {
      const pu = gs.powerUps[i];
      pu.y += pu.vy;

      if (
        pu.y + pu.height >= p.y &&
        pu.y <= p.y + p.height &&
        pu.x + pu.width >= p.x &&
        pu.x <= p.x + p.width
      ) {
        applyPowerUp(pu.type, pu.x, pu.y);
        gs.powerUps.splice(i, 1);
        continue;
      }

      if (pu.y > CANVAS_HEIGHT + 20) {
        gs.powerUps.splice(i, 1);
      }
    }

    // Update balls physics & collisions
    const activeSpeed = gs.slowTimer > 0 ? BALL_BASE_SPEED * 0.72 : BALL_BASE_SPEED;

    for (let i = gs.balls.length - 1; i >= 0; i--) {
      const ball = gs.balls[i];
      if (ball.isStuckToPaddle) continue;

      ball.trail.unshift({ x: ball.x, y: ball.y, alpha: 0.65 });
      if (ball.trail.length > 8) ball.trail.pop();

      const currentSpeed = Math.hypot(ball.vx, ball.vy);
      if (currentSpeed > 0) {
        const speedRatio = activeSpeed / currentSpeed;
        ball.vx *= speedRatio;
        ball.vy *= speedRatio;
      }

      if (Math.abs(ball.vy) < 1.2) {
        ball.vy = ball.vy < 0 ? -1.5 : 1.5;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;

      // Side wall bounce
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx);
        sound.playWallHit();
        addParticles(ball.x, ball.y, '#38bdf8', 6, 0.8, false);
      } else if (ball.x + ball.radius > CANVAS_WIDTH) {
        ball.x = CANVAS_WIDTH - ball.radius;
        ball.vx = -Math.abs(ball.vx);
        sound.playWallHit();
        addParticles(ball.x, ball.y, '#38bdf8', 6, 0.8, false);
      }

      // Top wall bounce
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy);
        sound.playWallHit();
        addParticles(ball.x, ball.y, '#38bdf8', 6, 0.8, false);
      }

      // Bottom barrier bounce
      if (gs.barrierHits > 0 && ball.y + ball.radius >= CANVAS_HEIGHT - 6) {
        ball.y = CANVAS_HEIGHT - 6 - ball.radius;
        ball.vy = -Math.abs(ball.vy);
        gs.barrierHits -= 1;
        sound.playBarrierBounce();
        addParticles(ball.x, ball.y, '#3b82f6', 22, 1.8, true);
        addFloatingText(ball.x, ball.y - 20, '🛡️ 防護力場反彈!', '#60a5fa');
        continue;
      }

      // Paddle collision
      if (
        ball.y + ball.radius >= p.y &&
        ball.y - ball.radius <= p.y + p.height &&
        ball.x >= p.x - ball.radius &&
        ball.x <= p.x + p.width + ball.radius &&
        ball.vy > 0
      ) {
        if (p.isSticky || gs.stickyTimer > 0) {
          ball.isStuckToPaddle = true;
          ball.stuckOffsetX = ball.x - (p.x + p.width / 2);
          sound.playPaddleHit(0);
          continue;
        }

        const hitOffset = (ball.x - (p.x + p.width / 2)) / (p.width / 2);
        const clampedOffset = Math.max(-0.92, Math.min(0.92, hitOffset));
        const maxBounceAngle = (Math.PI / 180) * 65;
        const bounceAngle = clampedOffset * maxBounceAngle;

        const newSpeed = activeSpeed;
        ball.vx = Math.sin(bounceAngle) * newSpeed + p.tilt * 1.5;
        ball.vy = -Math.cos(bounceAngle) * newSpeed;
        ball.y = p.y - ball.radius - 1;

        sound.playPaddleHit(p.tilt);
        addParticles(ball.x, ball.y, '#38bdf8', 12, 1.0, false);
      }

      // Brick collisions
      for (let j = gs.bricks.length - 1; j >= 0; j--) {
        const brick = gs.bricks[j];

        // Intangible glitch brick check
        if (brick.type === 'glitch' && brick.isPhasedOut) continue;

        const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
        const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
        const distX = ball.x - closestX;
        const distY = ball.y - closestY;
        const distanceSquared = distX * distX + distY * distY;

        if (distanceSquared <= ball.radius * ball.radius) {
          const isFire = ball.isFireball || gs.fireballTimer > 0;
          const isMega = ball.isMegaBall || gs.megaBallTimer > 0;

          if (!isFire && !isMega) {
            const overlapLeft = ball.x - brick.x;
            const overlapRight = brick.x + brick.width - ball.x;
            const overlapTop = ball.y - brick.y;
            const overlapBottom = brick.y + brick.height - ball.y;

            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
              ball.vx = -ball.vx;
            } else {
              ball.vy = -ball.vy;
            }
          }

          if (isMega) {
            sound.playMegaBallHit();
          }

          handleBrickHit(brick, isFire, isMega);
          break;
        }
      }

      // Fall off
      if (ball.y - ball.radius > CANVAS_HEIGHT) {
        gs.balls.splice(i, 1);
      }
    }

    // Ball lost logic
    if (gs.balls.length === 0) {
      gs.lives -= 1;
      sound.playBallLost();

      if (gs.lives > 0) {
        resetBallOnPaddle();
        gs.status = 'idle';
      } else {
        gs.status = 'gameover';
        sound.playGameOver();
        onGameOver(gs.score);
      }
    }

    // Win condition check
    const remainingDestructibles = gs.bricks.filter((b) => b.type !== 'unbreakable');
    if (remainingDestructibles.length === 0 && gs.bricks.length >= 0 && gs.status !== 'levelwin') {
      gs.status = 'levelwin';
      sound.playLevelWin();
      for (let i = 0; i < 70; i++) {
        addParticles(
          CANVAS_WIDTH / 2 + (Math.random() * 400 - 200),
          CANVAS_HEIGHT / 2 + (Math.random() * 200 - 100),
          ['#38bdf8', '#ec4899', '#facc15', '#4ade80', '#a855f7'][Math.floor(Math.random() * 5)],
          2,
          2.5,
          true
        );
      }
      setTimeout(() => {
        onLevelComplete();
      }, 1400);
    }

    // Update particles
    for (let i = gs.particles.length - 1; i >= 0; i--) {
      const pt = gs.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.08;
      pt.alpha -= pt.decay;
      if (pt.alpha <= 0) {
        gs.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = gs.floatingTexts.length - 1; i >= 0; i--) {
      const ft = gs.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      ft.scale = Math.min(1.2, ft.scale + 0.015);
      if (ft.alpha <= 0) {
        gs.floatingTexts.splice(i, 1);
      }
    }

    onStatsUpdate({
      score: gs.score,
      highScore: parseInt(localStorage.getItem('neon_breakout_highscore') || '0', 10),
      lives: gs.lives,
      levelIndex: 0,
      combo: gs.combo,
      maxCombo: gs.maxCombo,
      bricksBroken: gs.bricksBroken,
      ballsLaunched: gs.ballsLaunched,
      isFeverActive: gs.feverActive,
    });

    setActiveEffects({
      laser: Math.ceil(gs.laserTimer),
      fireball: Math.ceil(gs.fireballTimer),
      expand: Math.ceil(gs.expandTimer),
      sticky: Math.ceil(gs.stickyTimer),
      slow: Math.ceil(gs.slowTimer),
      megaball: Math.ceil(gs.megaBallTimer),
      barrierHits: gs.barrierHits,
      isFever: gs.feverActive,
    });
  };

  // Render loop
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gs = gameStateRef.current;

    ctx.save();

    if (gs.shakeTime > 0) {
      const shakeX = (Math.random() - 0.5) * gs.shakeMagnitude;
      const shakeY = (Math.random() - 0.5) * gs.shakeMagnitude;
      ctx.translate(shakeX, shakeY);
    }

    // Background theme styling
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    if (currentLevel.theme === 'boss') {
      bgGrad.addColorStop(0, '#1a050d');
      bgGrad.addColorStop(1, '#050103');
    } else if (currentLevel.theme === 'matrix') {
      bgGrad.addColorStop(0, '#04150d');
      bgGrad.addColorStop(1, '#010603');
    } else if (currentLevel.theme === 'galaxy') {
      bgGrad.addColorStop(0, '#0d081f');
      bgGrad.addColorStop(1, '#030208');
    } else {
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#020408');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Fever Mode glowing pulsing border
    if (gs.feverActive) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 18;
      ctx.strokeRect(4, 4, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 8);
      ctx.restore();
    }

    // Grid lines
    ctx.strokeStyle = currentLevel.theme === 'matrix' 
      ? 'rgba(16, 185, 129, 0.15)' 
      : 'rgba(30, 41, 59, 0.45)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Boss Health Bar (if level is a boss level)
    if (currentLevel.bossName) {
      const remaining = gs.bricks.filter((b) => b.type !== 'unbreakable').length;
      const progress = gs.totalDestructibles > 0 ? remaining / gs.totalDestructibles : 0;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(CANVAS_WIDTH / 2 - 180, 12, 360, 22);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(CANVAS_WIDTH / 2 - 180, 12, 360, 22);

      // Boss bar fill
      const fillGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 178, 0, CANVAS_WIDTH / 2 + 178, 0);
      fillGrad.addColorStop(0, '#ea580c');
      fillGrad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = fillGrad;
      ctx.fillRect(CANVAS_WIDTH / 2 - 178, 14, Math.max(0, 356 * progress), 18);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`☠️ BOSS: ${currentLevel.bossName} [${Math.round(progress * 100)}%]`, CANVAS_WIDTH / 2, 23);
      ctx.restore();
    }

    // Draw Bottom Barrier if active
    if (gs.barrierHits > 0) {
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT - 4);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 4);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Predictive Aiming Guide line when ball is waiting
    const stuckBall = gs.balls.find((b) => b.isStuckToPaddle);
    if (stuckBall) {
      ctx.save();
      const p = gs.paddle;
      const offset = stuckBall.stuckOffsetX || 0;
      const normalizedOffset = offset / (p.width / 2);
      const angle = -Math.PI / 2 + normalizedOffset * ((Math.PI / 180) * 60);

      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(stuckBall.x, stuckBall.y);
      const aimLength = 180;
      ctx.lineTo(
        stuckBall.x + Math.sin(angle) * aimLength,
        stuckBall.y - Math.cos(angle) * aimLength
      );
      ctx.stroke();
      ctx.restore();
    }

    // Draw Bricks
    gs.bricks.forEach((brick) => {
      ctx.save();
      const style = BRICK_COLORS[brick.type];

      // Handle glitch phasing transparency
      if (brick.type === 'glitch' && brick.isPhasedOut) {
        ctx.globalAlpha = 0.2;
      }

      ctx.shadowColor = style.glow;
      ctx.shadowBlur = 8;

      ctx.fillStyle = style.fill;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

      // Bevel highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 3);

      // Cracked visual if damaged
      if (brick.maxHp > 1 && brick.hp < brick.maxHp) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(brick.x + brick.width * 0.3, brick.y + 3);
        ctx.lineTo(brick.x + brick.width * 0.5, brick.y + brick.height * 0.6);
        ctx.lineTo(brick.x + brick.width * 0.75, brick.y + brick.height - 3);
        ctx.stroke();
      }

      // Brick Icons
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (brick.type === 'tnt') {
        ctx.fillText('TNT', brick.x + brick.width / 2, brick.y + brick.height / 2 + 1);
      } else if (brick.type === 'powerup') {
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('★', brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (brick.type === 'bumper') {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('🌀', brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (brick.type === 'glitch') {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(brick.isPhasedOut ? '◌' : '⚡', brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (brick.type === 'regen') {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('🧪', brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (brick.type === 'moving') {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('⬌', brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (brick.type === 'unbreakable') {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('🛡️', brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (brick.maxHp > 1) {
        ctx.fillText(`${brick.hp}`, brick.x + brick.width / 2, brick.y + brick.height / 2 + 1);
      }

      ctx.restore();
    });

    // Draw Falling Power-ups
    gs.powerUps.forEach((pu) => {
      ctx.save();
      ctx.shadowColor = pu.color;
      ctx.shadowBlur = 12;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = pu.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pu.x, pu.y, pu.width, pu.height, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = pu.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.symbol, pu.x + pu.width / 2, pu.y + pu.height / 2);

      ctx.restore();
    });

    // Draw Laser Bolts
    gs.lasers.forEach((laser) => {
      ctx.save();
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
      ctx.restore();
    });

    // Draw Paddle
    const p = gs.paddle;
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    ctx.rotate((p.tilt * Math.PI) / 180);

    const isLaserOn = p.isLaserActive || gs.laserTimer > 0;
    const isStickyOn = p.isSticky || gs.stickyTimer > 0;
    const paddleColor = isLaserOn ? '#f43f5e' : isStickyOn ? '#8b5cf6' : '#06b6d4';

    ctx.shadowColor = paddleColor;
    ctx.shadowBlur = 14;

    const paddleGrad = ctx.createLinearGradient(0, -p.height / 2, 0, p.height / 2);
    paddleGrad.addColorStop(0, '#f8fafc');
    paddleGrad.addColorStop(0.5, paddleColor);
    paddleGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = paddleGrad;
    ctx.beginPath();
    ctx.roundRect(-p.width / 2, -p.height / 2, p.width, p.height, 6);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (isLaserOn) {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-p.width / 2 - 2, -p.height / 2 - 4, 6, 8);
      ctx.fillRect(p.width / 2 - 4, -p.height / 2 - 4, 6, 8);
    }

    ctx.restore();

    // Draw Balls
    gs.balls.forEach((ball) => {
      ball.trail.forEach((t) => {
        ctx.save();
        ctx.fillStyle = ball.isMegaBall
          ? `rgba(168, 85, 247, ${t.alpha * 0.5})`
          : ball.isFireball
          ? `rgba(249, 115, 22, ${t.alpha * 0.5})`
          : `rgba(6, 182, 212, ${t.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.save();
      if (ball.isMegaBall) {
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#e9d5ff';
      } else if (ball.isFireball || gs.fireballTimer > 0) {
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#fdba74';
      } else {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
      }

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = ball.isMegaBall ? '#9333ea' : ball.isFireball ? '#ea580c' : '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    });

    // Draw Particles
    gs.particles.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.alpha);
      if (pt.glow) {
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
      }
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Floating Texts
    gs.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.font = 'bold 15px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // Idle Prompt
    if (gs.status === 'idle') {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 15px Noto Sans TC, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      const blink = Math.sin(Date.now() / 250) > 0;
      if (blink) {
        ctx.fillText('點擊滑鼠、輕觸螢幕或按 [空白鍵] 發射球體', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
      }
      ctx.restore();
    }

    ctx.restore();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gs = gameStateRef.current;
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gs.keys.left = true;
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gs.keys.right = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (gs.status === 'idle') {
          launchStuckBalls();
        } else if (gs.paddle.isLaserActive || gs.laserTimer > 0) {
          fireLasers();
        } else {
          launchStuckBalls();
        }
      }
      if (e.code === 'KeyP') {
        onTogglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const gs = gameStateRef.current;
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gs.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gs.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [launchStuckBalls, fireLasers, onTogglePause]);

  // Pointer / Mouse events on canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;
    gameStateRef.current.mousePos.x = clientX;
    gameStateRef.current.mousePos.active = true;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerMove(e);
    const gs = gameStateRef.current;
    if (gs.status === 'idle') {
      launchStuckBalls();
    } else if (gs.paddle.isLaserActive || gs.laserTimer > 0) {
      fireLasers();
    } else {
      launchStuckBalls();
    }
  };

  // Main 60FPS loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.06, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      updateGame(dt);
      draw();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-4xl mx-auto">
      {/* Active Power-up Status Badges */}
      <div className="w-full flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-3 overflow-x-auto text-slate-300">
          <span className="text-slate-400 font-sans text-xs">啟用效果:</span>
          {activeEffects.isFever && (
            <span className="text-yellow-400 font-bold flex items-center gap-1 animate-pulse">
              ⚡ 狂熱倍分 (FEVER x2)
            </span>
          )}
          {activeEffects.megaball > 0 && (
            <span className="text-purple-400 flex items-center gap-1">
              ☄️ 電漿巨球 ({activeEffects.megaball}s)
            </span>
          )}
          {activeEffects.laser > 0 && (
            <span className="text-rose-400 flex items-center gap-1">
              🔫 雷射砲 ({activeEffects.laser}s)
            </span>
          )}
          {activeEffects.fireball > 0 && (
            <span className="text-orange-400 flex items-center gap-1">
              🔥 烈焰球 ({activeEffects.fireball}s)
            </span>
          )}
          {activeEffects.expand > 0 && (
            <span className="text-emerald-400 flex items-center gap-1">
              ⬌ 寬擋板 ({activeEffects.expand}s)
            </span>
          )}
          {activeEffects.sticky > 0 && (
            <span className="text-purple-400 flex items-center gap-1">
              🧲 磁力吸附 ({activeEffects.sticky}s)
            </span>
          )}
          {activeEffects.barrierHits > 0 && (
            <span className="text-blue-400 flex items-center gap-1">
              🛡️ 底層護盾 ({activeEffects.barrierHits}次)
            </span>
          )}
          {activeEffects.slow > 0 && (
            <span className="text-cyan-400 flex items-center gap-1">
              ⏱️ 子彈時間 ({activeEffects.slow}s)
            </span>
          )}
          {!activeEffects.isFever &&
            activeEffects.megaball === 0 &&
            activeEffects.laser === 0 &&
            activeEffects.fireball === 0 &&
            activeEffects.expand === 0 &&
            activeEffects.sticky === 0 &&
            activeEffects.barrierHits === 0 &&
            activeEffects.slow === 0 && (
              <span className="text-slate-500">尚無增益道具（擊破發光磚塊獲得）</span>
            )}
        </div>

        <div className="text-slate-400 hidden sm:flex items-center gap-2 text-[11px]">
          <span>滑鼠/觸控滑動</span>
          <span>·</span>
          <span>空白鍵/點擊發球與射擊</span>
        </div>
      </div>

      {/* The Game Canvas */}
      <div className="relative w-full aspect-[840/620] bg-slate-950 border-2 border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.18)]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
        />

        {/* Mobile quick action button (Fire / Launch) */}
        <div className="sm:hidden absolute bottom-3 right-3 z-10">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              if (gameStateRef.current.status === 'idle') {
                launchStuckBalls();
              } else if (gameStateRef.current.paddle.isLaserActive || gameStateRef.current.laserTimer > 0) {
                fireLasers();
              } else {
                launchStuckBalls();
              }
            }}
            onClick={() => {
              if (gameStateRef.current.status === 'idle') {
                launchStuckBalls();
              } else if (gameStateRef.current.paddle.isLaserActive || gameStateRef.current.laserTimer > 0) {
                fireLasers();
              } else {
                launchStuckBalls();
              }
            }}
            className="w-14 h-14 rounded-full bg-cyan-500/80 active:bg-cyan-400 border-2 border-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/40 flex items-center justify-center backdrop-blur-sm"
          >
            FIRE
          </button>
        </div>

        {/* Paused Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
            <h2 className="text-3xl font-bold tracking-wider mb-2 font-['Chakra_Petch'] text-cyan-400">
              遊戲已暫停
            </h2>
            <p className="text-slate-400 text-sm mb-6">隨時可以繼續或重啟本關</p>
            <div className="flex items-center gap-3">
              <button
                onClick={onTogglePause}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors shadow-lg shadow-cyan-500/25"
              >
                繼續遊戲
              </button>
              <button
                onClick={onRestartLevel}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors border border-slate-700"
              >
                重新開始本關
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
